# Vercel 部署指南

## 快速部署步骤（约 2 分钟）

### 1. 准备代码

确保代码已推送到 GitHub：
```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 2. 部署到 Vercel

1. **访问 Vercel**
   - 打开：https://vercel.com/
   - 点击 **Sign Up** 或 **Log In**

2. **使用 GitHub 登录（推荐）**
   - 选择 **Continue with GitHub**
   - 授权 Vercel 访问你的 GitHub 账号

3. **导入项目**
   - 登录后，点击 **Add New Project**
   - 在 **Import Git Repository** 中找到 `booklist` 仓库
   - 点击 **Import**

4. **配置项目**
   - **Project Name**：`booklist`（或自定义）
   - **Framework Preset**：选择 **Other** 或 **Vite**（如果使用）
   - **Root Directory**：`./`（默认）
   - **Build Command**：留空（纯静态文件，无需构建）
   - **Output Directory**：留空（默认）
   - **Install Command**：留空

5. **环境变量（可选）**
   - 如果需要使用环境变量，点击 **Environment Variables**
   - 添加：
     ```
     SUPABASE_URL=https://vgwzodihcdkkareljztm.supabase.co
     SUPABASE_ANON_KEY=eyJhbGci...
     ```
   - **注意**：当前代码直接读取 `config.js`，不需要环境变量

6. **部署**
   - 点击 **Deploy**
   - 等待约 30-60 秒
   - 部署完成后会显示成功页面

7. **获取域名**
   - 部署成功后，你会得到一个域名：`https://booklist-xxxxx.vercel.app`
   - 也可以自定义域名

### 3. 验证 Supabase 连接

**重要更新**：Supabase 现在**默认允许跨域请求**，不需要手动配置 CORS！

1. **部署后测试**
   - 访问你的 Vercel 域名
   - 打开浏览器控制台（F12）
   - 应该看到 "✅ 使用 Supabase 数据库"
   - 尝试添加一本书，检查是否保存成功

2. **如果遇到 CORS 错误**
   - 检查 `config.js` 中的 URL 和 Key 是否正确
   - 确认 Supabase 项目正常运行
   - 检查浏览器控制台的错误信息
   - 确保 RLS 策略已正确配置（参考 `SUPABASE_SETUP.md`）

### 4. 测试功能

部署后测试以下功能：
- [ ] 网站可以正常访问
- [ ] 可以添加书籍
- [ ] 数据保存到 Supabase（检查 Supabase Dashboard）
- [ ] 搜索功能正常
- [ ] 笔记功能正常
- [ ] 编辑和删除功能正常
- [ ] 移动端响应式布局正常

## 自动部署

Vercel 会自动监听 GitHub 推送：
- 每次 `git push` 到 `main` 分支
- Vercel 会自动重新部署
- 部署通常只需 30-60 秒

## 自定义域名（可选）

1. **在 Vercel 中添加域名**
   - 项目页面 → **Settings** → **Domains**
   - 输入你的域名（如 `booklist.yourdomain.com`）
   - 按照提示配置 DNS

2. **更新 Supabase CORS**
   - 在 Supabase Dashboard 中添加新域名到 CORS

## 常见问题

### Q: 部署后无法连接 Supabase？

**A:** Supabase 默认允许跨域请求，如果遇到问题，检查：
1. ✅ `config.js` 中的 URL 和 Key 是否正确
2. ✅ Supabase 项目是否正常运行
3. ✅ RLS 策略是否正确配置（参考 `SUPABASE_SETUP.md`）
4. ✅ 打开浏览器控制台查看具体错误信息

### Q: 如何更新网站？

**A:** 
- 只需 `git push` 到 GitHub
- Vercel 会自动检测并重新部署
- 通常 30-60 秒内完成

### Q: 可以回滚到之前的版本吗？

**A:** 可以！
- Vercel Dashboard → **Deployments**
- 找到之前的部署版本
- 点击 **⋯** → **Promote to Production**

### Q: 如何查看部署日志？

**A:**
- Vercel Dashboard → 选择项目 → **Deployments**
- 点击某个部署 → 查看 **Build Logs**

## 部署后检查清单

- [ ] Vercel 部署成功
- [ ] 网站可以访问
- [ ] Supabase CORS 已配置
- [ ] 控制台显示 "✅ 使用 Supabase 数据库"
- [ ] 可以添加书籍
- [ ] 数据保存到 Supabase
- [ ] 所有功能正常

## 获取帮助

如果遇到问题：
1. 查看 Vercel Dashboard 的部署日志
2. 检查浏览器控制台的错误信息
3. 参考 `DEPLOY.md` 中的故障排除部分
