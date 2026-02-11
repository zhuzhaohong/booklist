# Vercel 环境变量配置指南

## 问题说明

`config.js` 文件包含敏感信息（Supabase API keys），已被 `.gitignore` 排除，不会推送到 GitHub。因此 Vercel 部署时没有这个文件，导致无法连接 Supabase。

## 解决方案：使用 Vercel 环境变量

### 步骤 1：在 Vercel 中设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的 `booklist` 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下两个环境变量：

   **变量 1：**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://vgwzodihcdkkareljztm.supabase.co`（你的 Supabase URL）
   - Environment: 选择 `Production`, `Preview`, `Development`（全选）

   **变量 2：**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnd3pvZGloY2Rra2FyZWxqenRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTUwOTAsImV4cCI6MjA4NjM3MTA5MH0.PAw5RMC3kk3luG8xrupZWRZyoH7kVMd5yHqlXaOAVQ4`（你的 Supabase anon key）
   - Environment: 选择 `Production`, `Preview`, `Development`（全选）

5. 点击 **Save**

### 步骤 2：修改代码以支持环境变量

需要修改 `index.html` 和 `config.js` 来读取环境变量。

### 步骤 3：重新部署

设置环境变量后，Vercel 会自动触发重新部署。或者手动点击 **Deployments** → **Redeploy**

## 注意事项

- 环境变量名称必须以 `VITE_` 开头才能在客户端访问
- 设置环境变量后需要重新部署才能生效
- 环境变量会在构建时注入到前端代码中
