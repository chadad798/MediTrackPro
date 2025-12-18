import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { handleCors } from '../_lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: '用户名、密码和姓名不能为空' });
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role === 'admin' ? 'ADMIN' : 'PHARMACIST',
      },
    });

    return res.status(200).json({
      success: true,
      message: '注册成功',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role.toLowerCase(),
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}
