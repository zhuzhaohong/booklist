# Vercel 部署问题排查

## 问题：一直显示"准备部署中"或"Building"

### 可能原因和解决方案

### 1. 构建配置问题

**问题**：Vercel 可能尝试运行构建命令，但项目是纯静态文件，无需构建。

**解决方案 A：添加 vercel.json**
- ✅ 已创建 `vercel.json` 配置文件
- 提交并推送后，Vercel 会自动识别为静态网站

**解决方案 B：修改 Vercel 项目设置**
1. 进入 Vercel Dashboard → 项目设置
2. 进入 **Settings** → **General**
3. 找到 **Build & Development Settings**
4. **Build Command**：输入 `echo "No build needed"` 或留空
5. **Output Directory**：留空或输入 `.`
6. **Install Command**：留空
7. 保存并重新部署

### 2. 检查部署日志

1. 进入 Vercel Dashboard → 项目页面
2. 点击 **Deployments** 标签
3. 点击正在部署的版本
4. 查看 **Build Logs** 或 **Function Logs**
5. 查看具体错误信息

### 3. 常见错误和解决方法

#### 错误：找不到 package.json
**解决**：已创建 `package.json` 文件，推送后重新部署

#### 错误：Build command failed
**解决**：
- 在项目设置中将 **Build Command** 设置为：`echo "No build needed"`
- 或完全留空

#### 错误：找不到入口文件
**解决**：
- 确保 `index.html` 在项目根目录
- 检查 **Root Directory** 设置是否正确

### 4. 手动触发重新部署

如果部署卡住：

1. **取消当前部署**
   - 在 Deployments 页面
   - 点击正在部署的版本
   - 点击 **Cancel**（如果有）

2. **重新部署**
   - 点击 **Redeploy** 按钮
   - 或推送新的 commit 触发自动部署

### 5. 简化配置（推荐）

如果问题持续，尝试最简配置：

1. **删除 vercel.json**（如果存在）
2. **在 Vercel 设置中**：
   - Framework Preset: **Other**
   - Build Command: **留空**
   - Output Directory: **留空**
   - Install Command: **留空**
3. **重新部署**

### 6. 检查文件结构

确保项目根目录包含：
- ✅ `index.html`
- ✅ `app.js`
- ✅ `styles.css`
- ✅ `config.js`（不会被提交，因为有 .gitignore）

### 7. 使用拖拽部署测试

如果 Git 部署一直有问题，可以先用拖拽部署测试：

1. 将所有文件打包成 zip（不包括 node_modules、.git 等）
2. 在 Vercel Dashboard 选择 **Deploy** → **Upload**
3. 拖拽 zip 文件
4. 如果拖拽部署成功，说明是 Git 配置问题

## 快速修复步骤

1. ✅ **已创建 `vercel.json`** - 帮助 Vercel 识别为静态网站
2. ✅ **已创建 `package.json`** - 避免找不到 package.json 的错误
3. **推送更新**：
   ```bash
   git add .
   git commit -m "添加 Vercel 配置文件"
   git push origin main
   ```
4. **在 Vercel Dashboard**：
   - 进入项目设置
   - 检查 Build Command 是否为空
   - 点击 **Redeploy**

## 如果仍然卡住

1. **查看详细日志**：
   - Vercel Dashboard → Deployments → 点击部署版本 → Build Logs
   - 复制错误信息

2. **尝试删除项目重新导入**：
   - 删除当前 Vercel 项目
   - 重新导入 GitHub 仓库
   - 使用最简配置

3. **联系支持**：
   - Vercel 支持：https://vercel.com/support
   - 提供部署日志和错误信息

## 预期部署时间

- ✅ **正常情况**：30-60 秒
- ⚠️ **如果超过 2 分钟**：可能有问题，需要检查日志
- ❌ **如果超过 5 分钟**：很可能卡住了，需要取消并重新部署
