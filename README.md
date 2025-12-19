# 💊 MediTrack Pro

现代化药房库存与销售管理系统

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📖 简介

MediTrack Pro 是一个功能完善的药房管理系统，帮助药店高效管理药品库存、追踪销售记录、控制用户权限。系统采用现代化技术栈，支持云端部署，提供流畅的用户体验。

## ✨ 功能特性

### 库存管理
- 📦 药品信息 CRUD（编码、名称、分类、厂商、价格、库存、有效期等）
- 🔒 药品锁定保护，防止误删
- 🗑️ 软删除 + 回收站，支持恢复
- 📝 修改历史追踪，完整审计日志
- ⚠️ 库存预警提醒
- 📥 批量导入药品

### 销售管理
- 🛒 销售开单，自动扣减库存
- 📊 销售记录查询
- 👤 客户信息记录

### 用户系统
- 🔐 JWT Token 认证
- 👥 角色权限控制（管理员 / 药剂师）
- 🔑 密码加密存储

### 数据看板
- 📈 销售统计
- 📉 库存概览
- 🔔 低库存预警

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **前端** | React 19, TypeScript, Vite, Tailwind CSS |
| **路由** | React Router v7 |
| **UI 组件** | Lucide React (图标), Recharts (图表) |
| **后端** | Vercel Serverless Functions |
| **数据库** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **认证** | JWT (jose), bcryptjs |
| **部署** | Vercel |

## 📁 项目结构

```
Web/
├── api/                    # Vercel Serverless API
│   ├── auth/              # 认证接口
│   │   ├── login.ts
│   │   └── register.ts
│   ├── drugs/             # 药品接口
│   │   ├── index.ts
│   │   ├── [id].ts
│   │   └── batch-delete.ts
│   ├── sales/             # 销售接口
│   │   └── index.ts
│   ├── users/             # 用户接口
│   │   └── me.ts
│   └── health.ts          # 健康检查
├── components/            # 公共组件
│   └── Layout.tsx
├── pages/                 # 页面组件
│   ├── Dashboard.tsx      # 数据看板
│   ├── Inventory.tsx      # 库存管理
│   ├── Sales.tsx          # 销售管理
│   ├── Login.tsx          # 登录/注册
│   └── Profile.tsx        # 个人设置
├── services/              # 服务层
│   └── dataService.ts     # API 调用封装
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   └── seed.ts            # 种子数据
├── App.tsx                # 应用入口
├── types.ts               # 类型定义
└── vercel.json            # Vercel 配置
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- PostgreSQL 数据库（推荐 [Neon](https://neon.tech)）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/meditrack-pro.git
cd meditrack-pro
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件：
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your-secret-key"
```

4. **初始化数据库**
```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库结构
npm run db:push

# （可选）导入种子数据
npm run db:seed
```

5. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:5173

### 部署到 Vercel

1. Fork 本项目到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量：
   - `DATABASE_URL`
   - `JWT_SECRET`
4. 部署完成！

## 📝 API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| GET | `/api/drugs` | 获取药品列表 |
| POST | `/api/drugs` | 添加药品 |
| PUT | `/api/drugs/:id` | 更新药品 |
| DELETE | `/api/drugs/:id` | 删除药品 |
| POST | `/api/drugs/batch-delete` | 批量删除 |
| GET | `/api/sales` | 获取销售记录 |
| POST | `/api/sales` | 创建销售 |
| GET | `/api/users/me` | 获取当前用户 |
| PUT | `/api/users/me` | 更新用户信息 |
| GET | `/api/health` | 健康检查 |

## 🔑 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 药剂师 | user | user123 |

> ⚠️ 生产环境请务必修改默认密码！

## 📄 License

MIT License © 2024

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
