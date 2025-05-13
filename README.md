# Thinking Quantum - 知识图谱增强的智能问答系统

基于知识图谱和大模型技术的人工智能导论课程问答系统，提供直观可视化和智能问答功能。

![Thinking Quantum](https://via.placeholder.com/800x400?text=Thinking+Quantum)

## 项目特色

- 📊 **交互式知识图谱** - 直观展示AI概念之间的关联
- 🤖 **智能问答系统** - 基于Neo4j知识图谱和大模型的问答功能
- 🔍 **GraphRAG技术** - 图增强检索与生成，提供更精准的回答
- 🎨 **现代化界面** - 采用Next.js 15和Tailwind CSS构建的流畅用户体验
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🔄 **丝滑动画** - 平滑过渡的用户界面，提升使用体验

## 技术栈

- **前端框架**: Next.js 15, React 18, TypeScript
- **UI组件**: Tailwind CSS, Radix UI
- **状态管理**: React Hooks
- **数据可视化**: D3.js
- **数据库**: Neo4j 图数据库
- **AI模型**: DeepSeek API
- **图增强检索**: 自定义GraphRAG实现

## 快速开始

### 环境要求

- Node.js 18+
- Neo4j 4.4+ (或Neo4j Desktop)
- npm 或 yarn

### 安装步骤

1. **克隆仓库**

```bash
git clone <repository-url>
cd thinking-quantum
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建`.env.local`文件，添加以下配置：

```env
# Neo4j 配置
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here

# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Next.js 配置
NEXT_PUBLIC_API_URL=http://localhost:9002
```

4. **启动开发服务器**

```bash
npm run dev
```

应用将在 http://localhost:9002 启动

## 数据库配置

### 安装 Neo4j

**选项 1: 使用 Neo4j Desktop (推荐)**

1. 下载并安装 [Neo4j Desktop](https://neo4j.com/download/)
2. 创建新的数据库实例
3. 设置密码并启动数据库
4. 记录连接信息(默认: bolt://localhost:7687)

**选项 2: 使用 Docker**

```bash
docker run -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:latest
```

### 测试连接

项目提供了连接测试脚本：

```bash
node scripts/test-neo4j-connection.js
```

此脚本会:
- 询问你的Neo4j连接信息
- 测试连接是否成功
- 保存设置到`.env.local`文件

### 导入知识图谱数据

项目使用自定义知识图谱数据。导入前请确保:

1. 准备JSON格式的知识数据文件，格式如下：
```json
{
  "entities": [
    { "name": "机器学习", "type": "AI_Concept", "description": "..." },
    ...
  ],
  "relationships": [
    { "from": "机器学习", "to": "深度学习", "type": "包含" },
    ...
  ]
}
```

2. 修改`scripts/import-data.js`最后一行的文件路径指向您的JSON文件
```javascript
const dataPath = 'path/to/your/data.json';
```

3. 运行导入脚本：
```bash
node scripts/import-data.js
```

成功导入将显示确认信息和导入的实体与关系数量。

## 使用指南

### 智能问答功能

1. 打开应用，默认进入"问答"页面
2. 在输入框中输入关于AI的问题，如"什么是机器学习？"
3. 点击发送按钮或按Enter键提交问题
4. 系统会基于知识图谱检索相关信息并生成回答
5. 您也可以点击建议问题快速开始对话

### 知识图谱可视化

1. 点击顶部导航栏的"图谱"按钮
2. 可视化界面将展示AI领域的概念及其关联
3. 可以拖拽节点、缩放图谱、点击节点查看详情
4. 搜索功能让您可以迅速定位特定概念

### 数据导入功能

1. 点击"数据导入"标签页
2. 上传符合格式要求的JSON数据文件
3. 系统会验证并处理数据
4. 导入成功后可以在图谱中查看新增内容

## 故障排除

### 常见问题

1. **Neo4j连接失败**
   - 确保Neo4j服务正在运行
   - 验证`.env.local`中的连接信息是否正确
   - 检查防火墙是否允许端口7687的访问

2. **数据导入错误**
   - 确保JSON文件格式正确
   - 检查数据中是否存在重复实体
   - 查看控制台错误日志获取详细信息

3. **DeepSeek API错误**
   - 确认API密钥是否正确配置
   - 检查网络连接
   - 查看API使用配额是否已满

4. **页面加载缓慢**
   - 大型知识图谱可能需要更多加载时间
   - 考虑增加Neo4j数据库的内存配置
   - 使用更高性能的服务器

## 项目结构

```
src/
├── app/                    # Next.js应用路由
│   ├── api/               # API路由
│   │   ├── chat/         # 聊天接口
│   │   └── graph/        # 图数据接口
│   └── page.tsx          # 主页面
├── components/            # React组件
│   ├── chat/             # 聊天界面组件
│   └── visualization/    # 图可视化组件
├── lib/                  # 核心库
│   ├── neo4j/            # Neo4j数据库操作
│   ├── deepseek/         # DeepSeek API集成
│   └── graphrag/         # GraphRAG实现
└── ai/                   # AI相关功能
```

## 扩展开发

项目设计为模块化架构，易于扩展：

1. **添加新的可视化组件**
   - 在`src/components/visualization/`中创建新组件
   - 集成到主页面或创建独立路由

2. **集成其他AI模型**
   - 在`src/lib/`下创建新的模型客户端
   - 修改`src/lib/graphrag/service.ts`中的模型调用

3. **增强知识图谱功能**
   - 扩展Neo4j查询
   - 添加新的图算法支持

## 许可证

本项目采用MIT许可证 - 详见[LICENSE](LICENSE)文件

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！请：

1. Fork本仓库
2. 创建您的特性分支(`git checkout -b feature/amazing-feature`)
3. 提交您的更改(`git commit -m 'Add some amazing feature'`)
4. 推送到分支(`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 联系方式

项目维护者: [您的名字] - [您的邮箱]

项目链接: [https://github.com/yourusername/thinking-quantum](https://github.com/yourusername/thinking-quantum) 