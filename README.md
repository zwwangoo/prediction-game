# 预测游戏系统

一个简单的预测游戏系统，允许用户创建和参与预测挑战。用户可以对事件结果进行预测，并在事件完成后确定胜负。

## 功能特性

- 用户管理
  - 创建新用户
  - 查看用户列表
  - 用户统计信息（总参与次数、胜负记录、资金统计等）

- 预测管理
  - 创建预测挑战
  - 设置预测金额和截止时间
  - 查看预测列表
  - 完成预测并确定胜负

- 数据统计
  - 用户胜负统计
  - 资金收益统计
  - 参与次数统计

## 技术栈

### 前端
- React
- TypeScript
- Material-UI
- date-fns

### 后端
- Node.js
- Express
- PostgreSQL

### 部署
- Docker
- Docker Compose
- Nginx

## 部署说明

1. 环境要求
   - Docker
   - Docker Compose

2. 配置环境变量
   ```bash
   # 复制环境变量示例文件
   cp .env.example .env
   
   # 编辑.env文件，设置以下变量：
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password_here
   POSTGRES_DB=prediction_game
   JWT_SECRET=your_jwt_secret_here
   ```

3. 启动服务
   ```bash
   # 构建并启动所有服务
   docker-compose up -d
   ```

4. 访问应用
   - 应用将在 http://localhost 上运行
   - API 服务通过 `/api` 路径访问

## 目录结构

```
.
├── client/                 # 前端代码
│   ├── src/               # 源代码
│   ├── public/            # 静态资源
│   └── Dockerfile         # 前端Docker配置
├── server/                # 后端代码
│   ├── index.js          # 入口文件
│   ├── init.sql          # 数据库初始化脚本
│   └── Dockerfile        # 后端Docker配置
├── docker-compose.yml     # Docker编排配置
├── .env.example          # 环境变量示例
└── README.md             # 项目说明文档
```

## 开发说明

1. 前端开发
   ```bash
   cd client
   npm install
   npm start
   ```

2. 后端开发
   ```bash
   cd server
   npm install
   npm start
   ```

## 数据库架构

### users 表
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) UNIQUE NOT NULL
- created_at: TIMESTAMP WITH TIME ZONE

### predictions 表
- id: SERIAL PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT
- amount: DECIMAL(10, 2) NOT NULL
- creator_id: INTEGER REFERENCES users(id)
- opponent_id: INTEGER REFERENCES users(id)
- creator_prediction: TEXT NOT NULL
- opponent_prediction: TEXT NOT NULL
- status: VARCHAR(50) DEFAULT 'pending'
- winner_id: INTEGER REFERENCES users(id)
- due_date: TIMESTAMP WITH TIME ZONE
- created_at: TIMESTAMP WITH TIME ZONE

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