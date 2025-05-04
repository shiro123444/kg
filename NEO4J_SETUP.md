# Neo4j 设置指南

## 解决认证问题

你遇到了 Neo4j 认证失败的错误。以下是解决步骤：

### 方法 1：使用设置脚本（推荐）

1. 首先安装必要的依赖：
```bash
npm install dotenv
```

2. 运行Neo4j连接测试脚本：
```bash
node scripts/test-neo4j-connection.js
```

此脚本会：
- 询问你的Neo4j连接信息
- 测试连接是否成功
- 询问是否要保存设置到 `.env.local` 文件

### 方法 2：手动配置

1. 创建或编辑 `.env.local` 文件：
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=你的实际密码
```

2. 确认Neo4j默认密码：
   - Neo4j 首次安装后，默认用户名是 `neo4j`
   - 首次登录时需要更改默认密码 `neo4j`
   - 如果你使用 Neo4j Desktop，可以在数据库详情中查看密码

### 方法 3：使用批处理脚本

运行完整的设置脚本：
```bash
scripts\setup-neo4j.bat
```

这个脚本会：
1. 安装必要的依赖
2. 引导你配置Neo4j连接
3. 可选地导入数据

## 常见问题

### 1. 忘记密码
如果忘记了Neo4j密码：
- Neo4j Desktop：在数据库管理界面重置密码
- 命令行版本：停止Neo4j服务，编辑 `neo4j.conf` 文件，设置 `dbms.security.auth_enabled=false`，重启服务后重置密码

### 2. 连接被拒绝
确保Neo4j服务正在运行：
- Neo4j Desktop：检查数据库状态，确保显示 "Started"
- 命令行：运行 `neo4j status` 或检查服务是否在运行

### 3. 错误的端口
默认端口：
- Bolt协议：7687
- HTTP：7474
- HTTPS：7473

确保使用正确的协议和端口，例如：`bolt://localhost:7687`

## 验证连接

成功配置后，你应该能看到类似输出：
```
✅ Successfully connected to Neo4j!
Settings saved to .env.local
```

## 导入数据

配置成功后，运行：
```bash
node scripts/import-data.js
```

成功的导入会显示：
```
✅ Successfully connected to Neo4j
Clearing existing database...
Database cleared.
Creating entities...
Created XXX entities.
Creating relationships...
Created YYY relationships.
Knowledge data import completed successfully!
```

## 进一步帮助

如果问题仍然存在：
1. 检查Neo4j日志文件
2. 确保防火墙没有阻止端口 7687
3. 尝试在Neo4j Browser (http://localhost:7474) 中测试连接
