import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { getAuthUser, handleCors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // 验证用户身份
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  // GET - 获取药品列表
  if (req.method === 'GET') {
    try {
      const includeDeleted = req.query.deleted === 'true';

      const drugs = await prisma.drug.findMany({
        where: {
          isDeleted: includeDeleted,
        },
        include: {
          createdBy: {
            select: { name: true },
          },
          deletedBy: {
            select: { name: true },
          },
          history: {
            include: {
              changedBy: {
                select: { name: true },
              },
            },
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formattedDrugs = drugs.map(drug => ({
        id: drug.id,
        code: drug.code,
        name: drug.name,
        category: drug.category,
        manufacturer: drug.manufacturer,
        price: drug.price,
        stock: drug.stock,
        minStockThreshold: drug.minStockThreshold,
        expiryDate: drug.expiryDate.toISOString().split('T')[0],
        description: drug.description,
        sideEffects: drug.sideEffects,
        isLocked: drug.isLocked,
        createdAt: drug.createdAt.toISOString(),
        createdBy: drug.createdBy?.name || '系统',
        deletedAt: drug.deletedAt?.toISOString(),
        deletedBy: drug.deletedBy?.name,
        history: drug.history.map(log => ({
          timestamp: log.timestamp.toISOString(),
          changedBy: log.changedBy.name,
          changes: log.changes as any[],
        })),
      }));

      return res.status(200).json({ success: true, data: formattedDrugs });
    } catch (error) {
      console.error('Get drugs error:', error);
      return res.status(500).json({ success: false, message: '获取药品列表失败' });
    }
  }

  // POST - 添加药品
  if (req.method === 'POST') {
    try {
      const body = req.body;
      
      // 批量添加
      if (Array.isArray(body)) {
        const drugs = await Promise.all(
          body.map(async (drugData: any) => {
            return prisma.drug.create({
              data: {
                code: drugData.code,
                name: drugData.name,
                category: drugData.category,
                manufacturer: drugData.manufacturer,
                price: parseFloat(drugData.price),
                stock: parseInt(drugData.stock),
                minStockThreshold: parseInt(drugData.minStockThreshold) || 10,
                expiryDate: new Date(drugData.expiryDate),
                description: drugData.description || null,
                sideEffects: drugData.sideEffects || null,
                isLocked: drugData.isLocked || false,
                createdById: user.userId,
              },
            });
          })
        );

        return res.status(200).json({ 
          success: true, 
          data: drugs, 
          message: `成功添加 ${drugs.length} 个药品` 
        });
      }

      // 单个添加
      const { code, name, category, manufacturer, price, stock, minStockThreshold, expiryDate, description, sideEffects, isLocked } = body;

      const existing = await prisma.drug.findUnique({ where: { code } });
      if (existing) {
        return res.status(400).json({ success: false, message: '药品编码已存在' });
      }

      const drug = await prisma.drug.create({
        data: {
          code,
          name,
          category,
          manufacturer,
          price: parseFloat(price),
          stock: parseInt(stock),
          minStockThreshold: parseInt(minStockThreshold) || 10,
          expiryDate: new Date(expiryDate),
          description: description || null,
          sideEffects: sideEffects || null,
          isLocked: isLocked || false,
          createdById: user.userId,
        },
      });

      return res.status(200).json({
        success: true,
        message: '药品添加成功',
        data: {
          id: drug.id,
          code: drug.code,
          name: drug.name,
          category: drug.category,
          manufacturer: drug.manufacturer,
          price: drug.price,
          stock: drug.stock,
          minStockThreshold: drug.minStockThreshold,
          expiryDate: drug.expiryDate.toISOString().split('T')[0],
          description: drug.description,
          isLocked: drug.isLocked,
          createdAt: drug.createdAt.toISOString(),
          createdBy: user.name,
          history: [],
        },
      });

    } catch (error) {
      console.error('Add drug error:', error);
      return res.status(500).json({ success: false, message: '添加药品失败' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
