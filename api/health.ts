import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 测试数据库连接
    const userCount = await prisma.user.count();
    const drugCount = await prisma.drug.count();
    const saleCount = await prisma.saleRecord.count();

    return res.status(200).json({
      success: true,
      message: 'API 运行正常',
      data: {
        database: 'connected',
        users: userCount,
        drugs: drugCount,
        sales: saleCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: error.message,
    });
  }
}
