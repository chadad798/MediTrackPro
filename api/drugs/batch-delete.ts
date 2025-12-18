import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { getAuthUser, handleCors } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供要删除的药品 ID 列表' });
    }

    // 检查是否有锁定的药品
    const drugs = await prisma.drug.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, isLocked: true },
    });

    const lockedDrugs = drugs.filter(d => d.isLocked);
    if (lockedDrugs.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `以下药品已锁定，无法删除: ${lockedDrugs.map(d => d.name).join(', ')}` 
      });
    }

    // 批量软删除
    const result = await prisma.drug.updateMany({
      where: { 
        id: { in: ids },
        isLocked: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: user.userId,
      },
    });

    return res.status(200).json({ 
      success: true, 
      data: { count: result.count }, 
      message: `成功删除 ${result.count} 个药品` 
    });

  } catch (error) {
    console.error('Batch delete error:', error);
    return res.status(500).json({ success: false, message: '批量删除失败' });
  }
}
