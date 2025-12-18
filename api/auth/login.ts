import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma';
import { signToken, handleCors } from '../_lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 处理 CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role.toLowerCase(),
        },
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}
