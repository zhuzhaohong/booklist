# 个人数字书架

## 运行方式

### 🚀 本地开发服务器（推荐用于测试）

**方法 1：使用启动脚本（推荐）**
- **macOS/Linux**: `./dev-server.sh` 或 `bash dev-server.sh`
- **Windows**: 双击 `dev-server.bat`

**方法 2：直接使用 Python（最简单）**
```bash
python3 -m http.server 3000
```

**方法 3：使用 npm（需要先安装 Node.js）**
```bash
npm run dev
```

启动后访问：http://localhost:3000

### 📄 直接打开（简单测试）
- 双击打开 `index.html`（推荐用 Chrome / Edge / Safari）
- 注意：某些功能（如 Supabase）可能需要通过 HTTP 服务器访问

## 数据存储

### Supabase（推荐）
- 使用 Supabase 作为后端数据库
- 数据存储在云端，支持多设备同步
- 配置方式：参考 `SUPABASE_SETUP.md`

### localStorage（降级方案）
- 如果未配置 Supabase，会自动降级到浏览器 `localStorage`
- 数据仅保存在当前浏览器

## 主要功能
- 添加 / 编辑 / 删除书籍
- 阅读状态循环切换：想读 → 在读 → 已读 → 想读
- 评分（0–5 星）与"高评分 4+"筛选
- 顶部统计：总藏书、已读、在读
- 笔记功能：为每本书添加和编辑笔记
- 一键分享：分享书籍信息到剪贴板
- 搜索功能：支持按书名和作者搜索

## 文件结构
- `index.html`：页面结构
- `styles.css`：样式（响应式、卡片、渐变主题）
- `app.js`：业务逻辑（渲染、事件、Supabase/localStorage 数据操作）
- `config.js`：Supabase 配置文件（需要配置你的项目信息）
- `PRD.MD`：需求文档
- `SUPABASE_SETUP.md`：Supabase 集成指南

## 快速开始

### 使用 Supabase（推荐）
1. 按照 `SUPABASE_SETUP.md` 中的步骤配置 Supabase
2. 在 `config.js` 中填入你的 Supabase URL 和 API Key
3. 刷新页面即可使用

### 使用 localStorage
- 无需配置，直接打开 `index.html` 即可使用
- 数据仅保存在当前浏览器

## 部署上线

### 🚀 Vercel 部署（推荐）

**快速步骤**：
1. 访问 https://vercel.com/ 并使用 GitHub 登录
2. 点击 **Add New Project** → 选择 `booklist` 仓库
3. **Framework Preset** 选择 **Other**
4. **Build Command** 和 **Output Directory** 留空
5. 点击 **Deploy**（约 30-60 秒）
6. 获得域名：`https://booklist-xxxxx.vercel.app`
7. **注意**：Supabase 默认允许跨域请求，无需手动配置 CORS

**详细步骤**：参考 `VERCEL_DEPLOY.md`

### 其他方案

- **Netlify**：参考 `DEPLOY.md` 中的 Netlify 部分
- **GitHub Pages**：参考 `DEPLOY.md` 中的 GitHub Pages 部分
