import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { getAuthUser, handleCors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  // GET - 获取销售记录
  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const sales = await prisma.saleRecord.findMany({
        include: {
          cashier: {
            select: { name: true },
          },
          items: {
            include: {
              drug: {
                select: { name: true, code: true },
              },
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      });

      const formattedSales = sales.map(sale => ({
        id: sale.id,
        timestamp: sale.timestamp.toISOString(),
        totalAmount: sale.totalAmount,
        cashierName: sale.cashier.name,
        customerName: sale.customerName,
        items: sale.items.map(item => ({
          drugId: item.drugId,
          drugName: item.drug.name,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
          total: item.total,
        })),
      }));

      return res.status(200).json({ success: true, data: formattedSales });
    } catch (error) {
      console.error('Get sales error:', error);
      return res.status(500).json({ success: false, message: '获取销售记录失败' });
    }
  }

  // POST - 创建销售记录
  if (req.method === 'POST') {
    try {
      const { items, customerName } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: '购物车不能为空' });
      }

      // 验证库存并计算总额
      let totalAmount = 0;
      const validatedItems: any[] = [];

      for (const item of items) {
        const drug = await prisma.drug.findUnique({
          where: { id: item.drugId },
        });

        if (!drug) {
          return res.status(400).json({ success: false, message: `药品不存在: ${item.drugId}` });
        }

        if (drug.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `${drug.name} 库存不足，仅剩 ${drug.stock} 件` 
          });
        }

        const itemTotal = drug.price * item.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          drugId: drug.id,
          drugName: drug.name,
          quantity: item.quantity,
          priceAtSale: drug.price,
          total: itemTotal,
        });
      }

      // 创建事务
      const sale = await prisma.$transaction(async (tx) => {
        // 1. 创建销售记录
        const saleRecord = await tx.saleRecord.create({
          data: {
            totalAmount,
            customerName: customerName || '散客',
            cashierId: user.userId,
            items: {
              create: validatedItems.map(item => ({
                drugId: item.drugId,
                quantity: item.quantity,
                priceAtSale: item.priceAtSale,
                total: item.total,
              })),
            },
          },
          include: {
            items: true,
            cashier: { select: { name: true } },
          },
        });

        // 2. 更新库存
        for (const item of validatedItems) {
          await tx.drug.update({
            where: { id: item.drugId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        return saleRecord;
      });

      return res.status(200).json({
        success: true,
        message: '销售录入成功',
        data: {
          id: sale.id,
          timestamp: sale.timestamp.toISOString(),
          totalAmount: sale.totalAmount,
          cashierName: sale.cashier.name,
          customerName: sale.customerName,
          items: validatedItems,
        },
      });

    } catch (error) {
      console.error('Create sale error:', error);
      return res.status(500).json({ success: false, message: '销售录入失败' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
