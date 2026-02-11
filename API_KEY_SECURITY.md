# API Key 安全说明

## 当前状态

**API key 目前直接写在 `config.js` 文件中，没有使用环境变量。**

## 重要说明：前端应用的限制

### ⚠️ 前端无法真正"隐藏" API Key

对于**纯前端应用**（如本项目），即使使用环境变量，API key **仍然会在浏览器中暴露**，因为：

1. 前端代码会被发送到浏览器
2. 浏览器可以查看所有 JavaScript 代码
3. 环境变量在构建时会被注入到代码中
4. 任何人都可以通过"查看源代码"看到配置

### ✅ Supabase Anon Key 的设计理念

**Supabase 的 `anon key` 是设计为可以公开的**，原因：

1. **Row Level Security (RLS)**：Supabase 使用 RLS 策略保护数据
2. **权限控制**：anon key 只有有限的权限（由 RLS 策略定义）
3. **最佳实践**：Supabase 官方文档明确说明 anon key 可以公开

## 当前配置方式

### 方式 1：直接写在 config.js（当前方式）

```javascript
const SUPABASE_CONFIG = {
  url: "https://xxxxx.supabase.co",
  anonKey: "eyJhbGci...",
};
```

**优点**：
- 简单直接
- 无需额外配置

**缺点**：
- 代码中包含敏感信息（虽然可以公开）
- 如果提交到 Git，需要确保 config.js 不被提交

### 方式 2：使用环境变量（仍然会暴露）

如果你使用构建工具（如 Vite、Webpack），可以：

1. 创建 `.env` 文件：
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

2. 在代码中使用：
```javascript
const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};
```

**注意**：构建后，这些值仍然会出现在最终的 JavaScript 文件中。

## 安全最佳实践

### ✅ 推荐做法（当前项目）

1. **使用 RLS 策略保护数据**
   - 在 Supabase Dashboard 中配置 Row Level Security
   - 只允许必要的操作（读取、写入等）
   - 限制数据访问范围

2. **不要提交 config.js 到 Git**
   - 将 `config.js` 添加到 `.gitignore`
   - 提供 `config.example.js` 作为模板
   - 在 README 中说明如何配置

3. **定期轮换 API Key**
   - 如果 key 泄露，可以在 Supabase Dashboard 中重新生成

### 🔒 如果需要真正的安全（需要后端）

如果确实需要隐藏 API key，需要：

1. **使用服务端代理**
   - 创建一个后端 API
   - 在后端使用 `service_role` key（永远不要暴露）
   - 前端调用你的后端 API，而不是直接调用 Supabase

2. **使用 Supabase Edge Functions**
   - 创建 Edge Functions 处理敏感操作
   - 在 Edge Function 中使用 service_role key

## 当前项目的安全措施

### 已实施

1. ✅ 使用 `anon key`（可以公开）
2. ✅ 配置了 RLS 策略（在 SUPABASE_SETUP.md 中）
3. ✅ 创建了 `.gitignore`（避免提交敏感文件）

### 建议添加

1. ⚠️ 将 `config.js` 添加到 `.gitignore`
2. ⚠️ 创建 `config.example.js` 作为模板
3. ⚠️ 在文档中说明安全注意事项

## 检查清单

- [ ] `config.js` 已添加到 `.gitignore`
- [ ] `config.example.js` 已创建（不含真实 key）
- [ ] Supabase RLS 策略已正确配置
- [ ] 文档中说明了安全注意事项

## 总结

**对于纯前端应用：**
- ✅ Supabase anon key **可以公开**（有 RLS 保护）
- ✅ 当前配置方式**是安全的**（前提是 RLS 已配置）
- ⚠️ 如果提交到 Git，确保 `config.js` 不被提交

**如果需要更高级的安全：**
- 使用服务端代理
- 使用 Supabase Edge Functions
- 实施用户认证和授权
