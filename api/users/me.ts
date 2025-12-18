import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { getAuthUser, handleCors } from '../_lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  // GET - 获取当前用户信息
  if (req.method === 'GET') {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      if (!userData) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: userData.id,
          username: userData.username,
          name: userData.name,
          role: userData.role.toLowerCase(),
          createdAt: userData.createdAt.toISOString(),
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ success: false, message: '获取用户信息失败' });
    }
  }

  // PUT - 更新用户信息
  if (req.method === 'PUT') {
    try {
      const { name, password } = req.body;

      const updateData: any = {};

      if (name) {
        updateData.name = name;
      }

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: '没有要更新的字段' });
      }

      const updated = await prisma.user.update({
        where: { id: user.userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      });

      return res.status(200).json({
        success: true,
        message: '用户信息更新成功',
        data: {
          id: updated.id,
          username: updated.username,
          name: updated.name,
          role: updated.role.toLowerCase(),
        },
      });

    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ success: false, message: '更新用户信息失败' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
