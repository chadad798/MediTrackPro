import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { getAuthUser, handleCors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  // 从 URL 获取药品 ID
  const { id } = req.query;
  const drugId = Array.isArray(id) ? id[0] : id;

  if (!drugId) {
    return res.status(400).json({ success: false, message: '缺少药品 ID' });
  }

  // GET - 获取单个药品
  if (req.method === 'GET') {
    try {
      const drug = await prisma.drug.findUnique({
        where: { id: drugId },
        include: {
          createdBy: { select: { name: true } },
          deletedBy: { select: { name: true } },
          history: {
            include: { changedBy: { select: { name: true } } },
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!drug) {
        return res.status(404).json({ success: false, message: '药品不存在' });
      }

      return res.status(200).json({
        success: true,
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
        },
      });
    } catch (error) {
      console.error('Get drug error:', error);
      return res.status(500).json({ success: false, message: '获取药品详情失败' });
    }
  }

  // PUT - 更新药品
  if (req.method === 'PUT') {
    try {
      const body = req.body;
      const { action } = body;

      // 切换锁定状态
      if (action === 'toggleLock') {
        if (user.role !== 'ADMIN') {
          return res.status(403).json({ success: false, message: '只有管理员可以更改锁定状态' });
        }

        const drug = await prisma.drug.findUnique({ where: { id: drugId } });
        if (!drug) {
          return res.status(404).json({ success: false, message: '药品不存在' });
        }

        const updated = await prisma.drug.update({
          where: { id: drugId },
          data: { isLocked: !drug.isLocked },
        });

        return res.status(200).json({ 
          success: true, 
          data: { isLocked: updated.isLocked }, 
          message: updated.isLocked ? '已锁定' : '已解锁' 
        });
      }

      // 恢复药品
      if (action === 'restore') {
        const updated = await prisma.drug.update({
          where: { id: drugId },
          data: {
            isDeleted: false,
            deletedAt: null,
            deletedById: null,
          },
        });

        return res.status(200).json({ success: true, data: { id: updated.id }, message: '药品已恢复' });
      }

      // 普通更新
      const originalDrug = await prisma.drug.findUnique({ where: { id: drugId } });
      if (!originalDrug) {
        return res.status(404).json({ success: false, message: '药品不存在' });
      }

      // 计算变更
      const changes: any[] = [];
      const fieldsToCheck = ['name', 'code', 'category', 'manufacturer', 'price', 'stock', 'minStockThreshold', 'expiryDate', 'description', 'sideEffects'];
      
      fieldsToCheck.forEach(field => {
        let oldValue = (originalDrug as any)[field];
        let newValue = body[field];

        if (field === 'expiryDate') {
          oldValue = originalDrug.expiryDate.toISOString().split('T')[0];
        }

        if (oldValue !== newValue && newValue !== undefined) {
          changes.push({ field, oldValue, newValue });
        }
      });

      const updateData: any = {
        name: body.name,
        code: body.code,
        category: body.category,
        manufacturer: body.manufacturer,
        price: parseFloat(body.price),
        stock: parseInt(body.stock),
        minStockThreshold: parseInt(body.minStockThreshold),
        description: body.description || null,
        sideEffects: body.sideEffects || null,
      };

      if (body.expiryDate) {
        updateData.expiryDate = new Date(body.expiryDate);
      }

      const updated = await prisma.drug.update({
        where: { id: drugId },
        data: updateData,
      });

      // 记录历史
      if (changes.length > 0) {
        await prisma.modificationLog.create({
          data: {
            drugId: drugId,
            changedById: user.userId,
            changes: changes,
          },
        });
      }

      return res.status(200).json({
        success: true,
        message: '药品信息更新成功',
        data: {
          id: updated.id,
          code: updated.code,
          name: updated.name,
          category: updated.category,
          manufacturer: updated.manufacturer,
          price: updated.price,
          stock: updated.stock,
          minStockThreshold: updated.minStockThreshold,
          expiryDate: updated.expiryDate.toISOString().split('T')[0],
          description: updated.description,
          sideEffects: updated.sideEffects,
          isLocked: updated.isLocked,
        },
      });

    } catch (error) {
      console.error('Update drug error:', error);
      return res.status(500).json({ success: false, message: '更新药品失败' });
    }
  }

  // DELETE - 删除药品
  if (req.method === 'DELETE') {
    try {
      const permanent = req.query.permanent === 'true';

      const drug = await prisma.drug.findUnique({ where: { id: drugId } });
      if (!drug) {
        return res.status(404).json({ success: false, message: '药品不存在' });
      }

      if (drug.isLocked && !permanent) {
        return res.status(403).json({ success: false, message: '该药品已锁定，无法删除' });
      }

      if (permanent) {
        if (user.role !== 'ADMIN') {
          return res.status(403).json({ success: false, message: '只有管理员可以彻底删除药品' });
        }

        await prisma.drug.delete({ where: { id: drugId } });
        return res.status(200).json({ success: true, message: '药品已彻底删除' });
      } else {
        await prisma.drug.update({
          where: { id: drugId },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedById: user.userId,
          },
        });

        return res.status(200).json({ success: true, message: '药品已移至回收站' });
      }

    } catch (error) {
      console.error('Delete drug error:', error);
      return res.status(500).json({ success: false, message: '删除药品失败' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
