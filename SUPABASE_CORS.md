# Supabase CORS 配置说明

## 重要更新（2024-2025）

**Supabase 现在默认允许跨域请求，不需要手动配置 CORS！**

### 为什么不需要配置？

1. **默认行为**：Supabase 的 REST API 默认允许来自浏览器的跨域请求
2. **客户端库**：`@supabase/supabase-js` 会自动处理 CORS 相关的请求头
3. **RLS 保护**：数据安全由 Row Level Security (RLS) 策略保护，而不是 CORS

### 什么时候需要配置 CORS？

只有在以下情况下才需要特殊配置：

1. **使用 Edge Functions**：如果创建了自定义 Edge Functions，需要在函数中处理 CORS
2. **自定义 API 端点**：如果使用 Supabase 作为后端，创建了自定义 API
3. **特殊安全需求**：企业级应用需要限制特定域名访问

### 对于本项目

✅ **无需任何 CORS 配置**，直接部署即可！

## 如果遇到 CORS 错误

如果部署后看到类似错误：
```
Access to fetch at 'https://xxxxx.supabase.co/...' from origin 'https://xxxxx.vercel.app' has been blocked by CORS policy
```

### 检查清单

1. **检查 config.js**
   - 确认 URL 格式正确：`https://xxxxx.supabase.co`
   - 确认 anonKey 正确

2. **检查 Supabase 项目状态**
   - 登录 Supabase Dashboard
   - 确认项目正常运行
   - 检查 API 是否可访问

3. **检查 RLS 策略**
   - 进入 **Authentication** → **Policies**
   - 确认 `books` 表的策略已正确配置
   - 参考 `SUPABASE_SETUP.md` 中的 SQL 脚本

4. **检查浏览器控制台**
   - 打开开发者工具（F12）
   - 查看 Network 标签中的请求
   - 查看 Console 中的错误信息

## 总结

- ✅ **无需配置 CORS**：Supabase 默认支持跨域
- ✅ **直接部署**：部署到 Vercel/Netlify 后即可使用
- ✅ **RLS 保护**：数据安全由 RLS 策略控制
- ⚠️ **如遇问题**：检查配置和 RLS 策略，而不是 CORS
