# 知识图谱问答系统 (Knowledge Graph Q&A System)

## 项目概述
这是一个基于Next.js构建的智能问答系统，结合了Google AI的生成能力和知识图谱技术。该系统不仅能回答用户的问题，还能自动从问答内容中提取实体和关系，构建动态的知识图谱。

## 技术栈
- **框架**: Next.js 15 (使用App Router)
- **UI框架**: Radix UI + Tailwind CSS
- **AI引擎**: Google Genkit + Google Gemini 2.0
- **状态管理**: React Hook Form
- **类型系统**: TypeScript
- **图标**: Lucide React
- **数据验证**: Zod

## 主要功能

### 1. 智能问答
- 用户可以输入任何问题
- 系统使用Google Gemini 2.0模型生成清晰、简洁的答案
- 支持实时加载状态显示

### 2. 知识图谱提取
- 自动从问答内容中识别关键实体（节点）
- 识别实体之间的关系（边）
- 每个实体包含：ID、标签、类型（可选）
- 每个关系包含：ID、源节点、目标节点、关系标签

### 3. 可视化展示
- 分离式展示问题和答案
- 独立的知识图谱页面
- 清晰的实体列表和关系列表展示

## 项目结构

```
src/
├── ai/                     # AI相关配置和流程
│   ├── ai-instance.ts      # AI实例配置
│   └── flows/              # AI工作流定义
│       └── generate-answer.ts  # 生成答案和知识图谱的流程
├── app/                    # Next.js 页面
│   ├── page.tsx           # 主页面 - 问答界面
│   └── graph/             # 图谱展示页面
│       └── page.tsx
├── components/             # React组件
│   ├── knowledge-graph-display.tsx  # 知识图谱展示组件
│   ├── qa-display.tsx      # 问答显示组件
│   ├── question-input.tsx  # 问题输入组件
│   └── ui/                # 基础UI组件
└── lib/                   # 工具函数
```

## 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 设置 Deepseek AI API 密钥：
```bash
DEEPSEEK_API_KEY=your_api_key_here
# 或者使用旧变量兼容：
GEMINI_API_KEY=your_api_key_here
```

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 开发模式运行：
```bash
npm run dev
```

3. 访问 http://localhost:9002 查看应用

## 核心创新点

### 1. 自动知识图谱提取
系统能够自动从问答内容中提取结构化的知识图谱，这一创新使得：
- 隐性知识变得显性化
- 问答内容可以被结构化存储
- 为后续的知识关联和推理奠定基础

### 2. 无缝的UI/UX设计
- 采用Apple设计理念，界面简洁直观
- 动画过渡流畅，提升用户体验
- 响应式设计，适配各种设备

### 3. 模块化架构
- 清晰的关注点分离
- 可重用的组件设计
- 易于维护和扩展

## 扩展建议

### 1. 大模型接口扩展
当前系统使用Google Gemini 2.0，可以考虑：
- **多模型支持**: 添加OpenAI、Anthropic等其他大模型接口
- **模型切换**: 让用户选择不同的AI模型
- **本地模型**: 集成如Llama 2等本地运行的模型

具体实现：
```typescript
// 在src/ai/providers/目录下创建模型提供者
export interface AIProvider {
  generateAnswer(input: string): Promise<GenerateAnswerOutput>;
}

// 实现不同的提供者
class OpenAIProvider implements AIProvider { ... }
class AnthropicProvider implements AIProvider { ... }
```

### 2. Neo4j图数据库集成
当前系统仅在内存中处理知识图谱，可以集成Neo4j进行持久化存储：

**步骤：**
1. 安装Neo4j驱动：
```bash
npm install neo4j-driver
```

2. 创建Neo4j服务：
```typescript
// src/services/neo4j.service.ts
import neo4j from 'neo4j-driver';

export class Neo4jService {
  private driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
  }

  async createNode(node: Node) {
    const session = this.driver.session();
    try {
      await session.run(
        'CREATE (n:Entity {id: $id, label: $label, type: $type})',
        node
      );
    } finally {
      await session.close();
    }
  }

  async createRelationship(edge: Edge) {
    const session = this.driver.session();
    try {
      await session.run(
        `MATCH (a:Entity {id: $source}), (b:Entity {id: $target})
         CREATE (a)-[r:${edge.label}]->(b)`,
        { source: edge.source, target: edge.target }
      );
    } finally {
      await session.close();
    }
  }
}
```

3. 在生成答案流程中集成Neo4j：
```typescript
// 修改 generate-answer.ts
const neo4jService = new Neo4jService();
// 在生成知识图谱后保存到Neo4j
await neo4jService.saveGraph(nodes, edges);
```

### 3. 知识图谱可视化增强
当前系统使用列表形式展示图谱，可以添加：

1. **图形化展示**: 使用D3.js或Cytoscape.js实现图谱可视化
2. **交互功能**: 节点拖拽、缩放、筛选
3. **图谱分析**: 中心性分析、社区检测、路径查找

### 4. 功能增强建议

1. **历史记录**: 保存用户的问答历史
2. **知识搜索**: 基于已有图谱的智能搜索
3. **批量导入**: 支持从文档批量提取知识图谱
4. **API接口**: 提供RESTful API供其他应用调用
5. **用户系统**: 添加用户认证和个性化知识库

### 5. 性能优化
1. **缓存机制**: 对常见问题的答案进行缓存
2. **流式响应**: 实现流式输出以提升用户体验
3. **并发处理**: 优化多用户场景下的性能

## Neo4j接口位置和交互逻辑
目前项目中**尚未实现Neo4j接口**，这是一个很好的扩展方向。建议的实现方案：

1. **接口位置**: 创建 `src/services/neo4j/` 目录
2. **交互逻辑**:
   - 问答后自动保存知识图谱到Neo4j
   - 提供查询接口，基于已有图谱增强回答
   - 实现知识图谱的增量更新和去重

## 创新改进建议

1. **语义增强**: 使用词向量相似度自动发现隐含关系
2. **多轮对话**: 支持上下文感知的连续对话
3. **知识融合**: 自动合并相似实体，构建更完整的知识网络
4. **推理能力**: 基于图谱进行简单的逻辑推理
5. **领域适配**: 为特定领域（医疗、法律等）定制提取规则

## 贡献指南
欢迎提交Issue和Pull Request。在提交代码前，请确保：
1. 代码符合项目的编码规范
2. 添加了必要的测试
3. 更新了相关文档

## 许可证
MIT License

## 联系方式
如有问题或建议，请提交Issue或联系维护者。
