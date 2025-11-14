# User Module Frontend

用户模块前端应用，基于 React + Vite + TypeScript + Tailwind CSS 构建。

## 功能特性

- ✅ 用户注册（支持邮箱验证码）
- ✅ 用户登录（RSA加密密码）
- ✅ 用户信息展示
- ✅ Token认证
- ✅ 现代化UI设计

## 技术栈

- **React 18** - UI框架
- **Vite** - 构建工具
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理
- **Axios** - HTTP客户端
- **JSEncrypt** - RSA加密

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

## 构建

```bash
npm run build
```

## 预览

```bash
npm run preview
```

## API配置

前端通过 Vite 代理连接到后端 API（`http://localhost:8080/api/user`）。

确保后端服务已启动并运行在 8080 端口。

## 项目结构

```
src/
  ├── pages/          # 页面组件
  │   ├── Login.tsx   # 登录页
  │   ├── Register.tsx # 注册页
  │   └── Profile.tsx  # 用户信息页
  ├── services/       # API服务
  │   └── api.ts      # API调用封装
  ├── utils/          # 工具函数
  │   ├── auth.ts     # 认证工具
  │   └── crypto.ts   # 加密工具
  ├── types/          # 类型定义
  │   └── api.ts      # API类型
  ├── App.tsx         # 主应用组件
  └── main.tsx        # 入口文件
```

