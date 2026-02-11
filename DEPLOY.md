# 部署指南

## 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **GitHub Pages** | 免费、简单、与 GitHub 集成 | 不支持环境变量、需要公开仓库 | ⭐⭐⭐ |
| **Netlify** | 免费、支持环境变量、自动部署 | 需要注册账号 | ⭐⭐⭐⭐⭐ |
| **Vercel** | 免费、快速、支持环境变量 | 需要注册账号 | ⭐⭐⭐⭐⭐ |
| **Supabase Storage** | 与 Supabase 集成 | 需要配置 | ⭐⭐⭐ |

## 方案 1：GitHub Pages（最简单）

### 步骤

1. **确保代码已推送到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **在 GitHub 上启用 Pages**
   - 进入仓库：https://github.com/zhuzhaohong/booklist
   - 点击 **Settings** → **Pages**
   - **Source** 选择 `main` 分支
   - **Folder** 选择 `/ (root)`
   - 点击 **Save**

3. **等待部署完成**
   - 几分钟后，访问：`https://zhuzhaohong.github.io/booklist/`

4. **配置 Supabase CORS（重要）**
   - 登录 Supabase Dashboard
   - 进入 **Settings** → **API**
   - 在 **CORS** 部分添加你的 GitHub Pages 域名：
     ```
     https://zhuzhaohong.github.io
     ```

### 注意事项

- ⚠️ **config.js 会暴露**：GitHub Pages 会公开所有文件
- ✅ **Supabase anon key 可以公开**（有 RLS 保护）
- ⚠️ 如果不想暴露 config.js，可以使用环境变量方案（Netlify/Vercel）

---

## 方案 2：Netlify（推荐）

### 步骤

1. **注册 Netlify 账号**
   - 访问：https://www.netlify.com/
   - 使用 GitHub 账号登录（推荐）

2. **部署方式 A：拖拽部署（最简单）**
   - 登录 Netlify Dashboard
   - 将整个项目文件夹拖拽到部署区域
   - 等待部署完成
   - 获得一个 `xxxxx.netlify.app` 的域名

3. **部署方式 B：Git 集成（推荐）**
   - 点击 **Add new site** → **Import an existing project**
   - 选择 **GitHub**，授权并选择 `booklist` 仓库
   - **Build command**：留空（纯静态文件）
   - **Publish directory**：留空或填 `/`
   - 点击 **Deploy site**

4. **配置环境变量（可选）**
   - 进入 **Site settings** → **Environment variables**
   - 添加：
     ```
     SUPABASE_URL=https://vgwzodihcdkkareljztm.supabase.co
     SUPABASE_ANON_KEY=eyJhbGci...
     ```
   - 修改 `config.js` 使用环境变量（需要构建工具）

5. **配置自定义域名（可选）**
   - **Domain settings** → **Add custom domain**
   - 输入你的域名并按照提示配置 DNS

6. **配置 Supabase CORS**
   - 在 Supabase Dashboard → **Settings** → **API**
   - 添加 Netlify 域名：`https://xxxxx.netlify.app`

### 优点

- ✅ 自动部署（Git push 后自动更新）
- ✅ 支持环境变量
- ✅ 免费 SSL 证书
- ✅ 全球 CDN

---

## 方案 3：Vercel（推荐）

### 步骤

1. **注册 Vercel 账号**
   - 访问：https://vercel.com/
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 **Add New Project**
   - 选择 **Import Git Repository**
   - 选择 `booklist` 仓库
   - **Framework Preset**：选择 **Other** 或 **Vite**（如果使用）
   - **Root Directory**：`./`
   - 点击 **Deploy**

3. **配置环境变量（可选）**
   - 项目设置 → **Environment Variables**
   - 添加 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`

4. **配置 Supabase CORS**
   - 添加 Vercel 域名到 Supabase CORS 设置

### 优点

- ✅ 极快的部署速度
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署

---

## 方案 4：Supabase Storage（与 Supabase 集成）

### 步骤

1. **构建静态文件**
   ```bash
   # 如果使用构建工具，先构建
   npm run build
   # 或直接使用现有文件
   ```

2. **上传到 Supabase Storage**
   - 登录 Supabase Dashboard
   - 进入 **Storage** → **Create bucket**
   - Bucket 名称：`booklist`
   - **Public bucket**：勾选（允许公开访问）
   - 上传所有文件（index.html, app.js, styles.css 等）

3. **配置静态网站托管**
   - 在 Storage 中设置 `index.html` 为默认文件
   - 获取公共 URL

### 优点

- ✅ 与 Supabase 集成
- ✅ 免费存储

---

## 推荐方案：Netlify 或 Vercel

### 为什么推荐？

1. **简单快速**：几分钟即可上线
2. **自动部署**：Git push 后自动更新
3. **环境变量支持**：可以保护敏感信息（虽然 anon key 可以公开）
4. **免费 SSL**：自动 HTTPS
5. **全球 CDN**：访问速度快

### 快速开始（Netlify）

1. 访问 https://www.netlify.com/
2. 使用 GitHub 登录
3. 点击 **Add new site** → **Import an existing project**
4. 选择 `booklist` 仓库
5. 点击 **Deploy site**
6. 等待部署完成（约 1-2 分钟）
7. 获得 `https://xxxxx.netlify.app` 域名
8. 在 Supabase Dashboard 中添加域名到 CORS

### 快速开始（Vercel）

1. 访问 https://vercel.com/
2. 使用 GitHub 登录
3. 点击 **Add New Project**
4. 选择 `booklist` 仓库
5. 点击 **Deploy**
6. 等待部署完成（约 30 秒）
7. 获得 `https://xxxxx.vercel.app` 域名
8. 在 Supabase Dashboard 中添加域名到 CORS

---

## 部署后检查清单

- [ ] 网站可以正常访问
- [ ] Supabase CORS 已配置
- [ ] 可以添加书籍
- [ ] 数据保存到 Supabase
- [ ] 搜索功能正常
- [ ] 笔记功能正常
- [ ] 响应式布局正常（移动端测试）

---

## 常见问题

### Q: 部署后无法连接 Supabase？

**A:** 检查 CORS 配置：
1. Supabase Dashboard → Settings → API
2. 添加你的部署域名到 CORS 列表
3. 确保包含协议：`https://xxxxx.netlify.app`

### Q: 环境变量如何使用？

**A:** 如果使用 Netlify/Vercel：
1. 在平台设置中添加环境变量
2. 需要修改代码使用 `import.meta.env`（Vite）或 `process.env`（Webpack）
3. 对于纯 HTML，建议直接写在 config.js（anon key 可以公开）

### Q: 如何更新网站？

**A:** 
- **Netlify/Vercel**：Git push 后自动更新
- **GitHub Pages**：Git push 后等待几分钟自动更新

### Q: 可以自定义域名吗？

**A:** 可以！
- Netlify/Vercel 都支持免费自定义域名
- 在平台设置中添加域名并配置 DNS

---

## 推荐流程

1. ✅ **使用 Netlify 或 Vercel**（最简单快速）
2. ✅ **连接 GitHub 仓库**（自动部署）
3. ✅ **配置 Supabase CORS**（允许域名访问）
4. ✅ **测试所有功能**（确保正常工作）
5. ✅ **可选：添加自定义域名**（更专业）
