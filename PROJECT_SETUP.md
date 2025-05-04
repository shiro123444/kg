# 人工智能导论知识图谱问答系统 - 项目设置指南

## 项目概述

本项目是一个基于 Neo4j 知识图谱的人工智能导论问答系统，结合了以下技术：
- Neo4j 图数据库存储知识图谱
- D3.js 进行知识图谱可视化
- Neo4j GraphRAG 实现图增强检索生成
- DeepSeek API 作为大语言模型
- Next.js 15 作为前端框架

## 环境要求

- Node.js 18+ 
- Neo4j 4.4+ 或 Neo4j Desktop
- npm 或 yarn

## 安装步骤

### 1. 安装依赖

```bash
npm install
npm install d3 neo4j-driver @types/d3
```

或使用项目中的依赖更新文件：

```bash
# 合并依赖到package.json后运行
npm install
```

### 2. 配置 Neo4j 数据库

#### 选项 1：使用 Neo4j Desktop
1. 下载并安装 [Neo4j Desktop](https://neo4j.com/download/)
2. 创建新的数据库实例
3. 记录数据库连接信息（默认：bolt://localhost:7687）

#### 选项 2：使用 Docker
```bash
docker run -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### 3. 配置环境变量

复制 `.env.example` 并创建 `.env.local`：

```bash
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here

# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:9002
```

### 4. 导入知识图谱数据

确保您的知识数据文件位于：`E:\ai_neo4j\ai_knowledge.json`

运行数据导入脚本：

```bash
# 使用 Node.js 运行
node scripts/import-data.js
```

### 5. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:9002 启动

## 项目结构

```
src/
├── app/                    # Next.js 应用路由
│   ├── api/               # API 路由
│   │   ├── chat/         # 聊天接口
│   │   └── graph/        # 图数据接口
│   └── page.tsx          # 主页面
├── components/            # React 组件
│   ├── chat/             # 聊天界面组件
│   └── visualization/    # 图可视化组件
└── lib/                  # 核心库
    ├── neo4j/            # Neo4j 数据库操作
    ├── deepseek/         # DeepSeek API 集成
    └── graphrag/         # GraphRAG 实现
```

## 功能特性

1. **智能问答**：基于知识图谱的问答系统
2. **可视化**：交互式知识图谱可视化
3. **GraphRAG**：图检索增强生成
4. **DeepSeek 集成**：使用 DeepSeek 大模型生成答案

## 使用说明

1. 启动应用后，访问 http://localhost:9002
2. 在"智能问答"标签页中输入您的问题
3. 系统将基于知识图谱检索相关信息并生成答案
4. 切换到"知识图谱"标签页查看可视化的知识结构

## 故障排除

### 常见问题

1. **Neo4j 连接失败**
   - 检查 Neo4j 服务是否正在运行
   - 验证环境变量中的连接信息
   - 确保数据库用户有足够权限

2. **数据导入错误**
   - 检查 JSON 文件格式是否正确
   - 确保文件路径正确
   - 查看控制台错误日志

3. **DeepSeek API 错误**
   - 验证 API 密钥是否正确
   - 检查网络连接
   - 查看 API 使用配额

## API 端点

- `GET /api/graph` - 获取知识图谱数据
- `POST /api/chat` - 发送问题并获取答案

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run typecheck

# 代码检查
npm run lint
```

## 注意事项

1. 确保 Neo4j 数据库正在运行
2. 首次运行需要导入知识数据
3. DeepSeek API 需要有效的 API 密钥
4. 建议使用最新版本的 Chrome 或 Firefox 浏览器

## 技术栈

- **前端**：Next.js 15, React 18, TypeScript
- **UI 组件**：Radix UI, Tailwind CSS
- **数据可视化**：D3.js
- **数据库**：Neo4j
- **AI/ML**：DeepSeek API
- **状态管理**：React Hooks

## 扩展建议

1. 添加用户认证系统
2. 实现多语言支持
3. 添加更多可视化选项
4. 集成更多 AI 模型
5. 增加数据导入/导出功能
6. 添加知识图谱编辑功能
