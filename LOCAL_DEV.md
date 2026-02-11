# 本地开发环境设置

## 🚀 快速开始

### 方法 1：使用启动脚本（推荐）

**macOS/Linux:**
```bash
./dev-server.sh
```

或

```bash
bash dev-server.sh
```

**Windows:**
双击 `dev-server.bat` 文件

启动后访问：http://localhost:3000

### 方法 2：直接使用 Python（最简单）

**macOS/Linux:**
```bash
./dev-server.sh
```

**Windows:**
双击 `dev-server.bat` 文件

### 方法 3：使用 npm（需要先安装 Node.js）

如果已安装 Node.js，可以使用：
```bash
npm run dev
```

**安装 Node.js（可选）:**
- 访问 https://nodejs.org/ 下载安装
- 或使用 Homebrew: `brew install node`

## 📝 开发工作流

1. **启动本地服务器**
   ```bash
   npm run dev
   ```

2. **修改代码**
   - 编辑 `index.html`、`styles.css` 或 `app.js`
   - 保存文件

3. **查看更改**
   - 浏览器会自动刷新（如果使用 `http-server` 的 `-o` 选项）
   - 或手动刷新浏览器页面（F5 或 Cmd+R）

4. **测试功能**
   - 所有功能都可以在本地测试
   - Supabase 连接也会正常工作（如果已配置 `config.js`）

5. **停止服务器**
   - 在终端按 `Ctrl+C`

## ✅ 优势

- ⚡ **快速迭代**：无需等待 GitHub 推送和 Vercel 部署
- 🔄 **实时预览**：修改代码后立即看到效果
- 🐛 **快速调试**：使用浏览器开发者工具调试更方便
- 💾 **本地测试**：可以测试 Supabase 和 localStorage 功能

## 🔧 注意事项

1. **端口占用**：如果 3000 端口被占用，可以修改脚本中的端口号
2. **Supabase 配置**：确保 `config.js` 文件存在并配置正确
3. **浏览器缓存**：如果遇到问题，尝试硬刷新（Cmd+Shift+R 或 Ctrl+Shift+R）

## 🆚 本地开发 vs 生产部署

| 特性 | 本地开发 | Vercel 部署 |
|------|---------|------------|
| 启动速度 | 即时 | 需要推送和部署（1-2分钟）|
| 测试速度 | 立即看到更改 | 需要等待部署完成 |
| 适合场景 | 开发、调试、测试 | 最终发布、分享 |
| 数据存储 | 使用相同的 Supabase | 使用相同的 Supabase |

## 💡 推荐工作流

1. **开发阶段**：使用本地服务器 (`npm run dev`)
2. **测试完成**：推送到 GitHub
3. **生产部署**：Vercel 自动部署

这样可以大大提高开发效率！
