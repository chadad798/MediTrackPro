import { SignJWT, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'meditrack-default-secret-change-in-production'
);

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'ADMIN' | 'PHARMACIST';
  name: string;
}

// 生成 JWT Token
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 从请求中提取并验证用户
export async function getAuthUser(req: VercelRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

// 设置 CORS 头
export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// 处理 OPTIONS 预检请求
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
