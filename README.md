# 预测挑战系统

一个简单的预测挑战系统，允许用户创建和管理预测记录，跟踪用户的预测历史和收益情况。

## 技术栈

### 前端
- React 18
- TypeScript
- Material-UI (MUI)
- date-fns

### 后端
- Node.js
- Express
- PostgreSQL

### 开发工具
- Docker
- Docker Compose

## 项目结构

```
prediction-game/
├── client/                 # 前端项目目录
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── types/        # TypeScript类型定义
│   │   ├── App.tsx       # 主应用组件
│   │   └── index.tsx     # 应用入口
│   ├── public/           # 静态资源
│   ├── package.json      # 前端依赖配置
│   └── tsconfig.json     # TypeScript配置
│
├── server/                # 后端项目目录
│   ├── index.js          # 服务器入口
│   ├── init.sql          # 数据库初始化脚本
│   └── package.json      # 后端依赖配置
│
├── docker-compose.yml    # Docker Compose配置
└── .env                  # 环境变量配置
```

## 功能特性

1. 用户管理
   - 创建新用户
   - 查看用户列表
   - 用户预测统计（总参与、胜负、收益等）

2. 预测挑战管理
   - 创建新预测
   - 查看预测列表
   - 设置预测结果
   - 自动计算收益

## 安装和运行

### 环境要求
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL 14+

### 开发环境设置

1. 克隆项目
```bash
git clone <repository-url>
cd prediction-game
```

2. 安装依赖
```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. 环境配置
```bash
# 在项目根目录创建.env文件
cp .env.example .env
# 编辑.env文件，设置必要的环境变量
```

4. 启动开发环境
```bash
# 启动数据库
docker-compose up -d

# 启动后端服务器（在server目录下）
npm start

# 启动前端开发服务器（在client目录下）
npm start
```

### 生产环境部署

1. 构建前端
```bash
cd client
npm run build
```

2. 使用Docker Compose启动所有服务
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API文档

### 用户相关API
- `GET /api/users` - 获取所有用户
- `POST /api/users` - 创建新用户

### 预测相关API
- `GET /api/predictions` - 获取所有预测记录
- `POST /api/predictions` - 创建新预测
- `PUT /api/predictions/:id/complete` - 完成预测并设置结果

## 开发规范

1. 代码风格
   - 使用ESLint和Prettier保持代码风格一致
   - 遵循TypeScript的类型定义规范

2. Git提交规范
   - 使用清晰的提交信息
   - 每个功能或修复使用单独的分支

## 许可证

MIT License 