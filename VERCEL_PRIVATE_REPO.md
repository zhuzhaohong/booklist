# Vercel 部署私有仓库指南

## ✅ Vercel 支持私有仓库

**好消息**：Vercel **完全支持**私有 GitHub 仓库部署！

### 免费版也支持

- ✅ Vercel 免费版支持私有仓库
- ✅ 无需升级到付费计划
- ✅ 功能与公开仓库完全相同

## 部署私有仓库的步骤

### 1. 授权 Vercel 访问私有仓库

在首次连接 GitHub 时：

1. **点击 "Continue with GitHub"**
2. **授权页面会显示权限请求**
3. **确保勾选以下权限**：
   - ✅ `repo` - 访问仓库（包括私有仓库）
   - ✅ `read:org` - 读取组织信息（如果仓库在组织下）

4. **如果之前已授权但未勾选私有仓库权限**：
   - 访问：https://github.com/settings/applications
   - 找到 **Vercel** 应用
   - 点击 **Configure** 或 **Edit**
   - 勾选 **Private repositories** 权限
   - 保存

### 2. 导入私有仓库

1. 在 Vercel Dashboard 点击 **Add New Project**
2. 在仓库列表中找到你的私有仓库 `booklist`
3. 如果看不到私有仓库：
   - 检查 GitHub 授权是否包含私有仓库权限
   - 重新授权 Vercel 访问私有仓库

### 3. 部署配置

私有仓库的部署配置与公开仓库完全相同：
- Framework Preset: **Other**
- Build Command: 留空
- Output Directory: 留空
- 点击 **Deploy**

## 常见问题

### Q: 为什么看不到我的私有仓库？

**A:** 检查以下几点：
1. ✅ GitHub 授权是否包含 `repo` 权限
2. ✅ 仓库是否在你的 GitHub 账号下
3. ✅ 尝试重新授权 Vercel

### Q: 私有仓库部署后，网站是公开的吗？

**A:** 
- **仓库是私有的**：GitHub 仓库本身保持私有
- **网站是公开的**：Vercel 部署的网站默认是公开访问的
- **可以设置密码保护**：Vercel Pro 计划支持密码保护部署

### Q: 免费版有限制吗？

**A:** 
- ✅ 私有仓库数量：无限制
- ✅ 部署次数：每月 100 次（通常足够）
- ✅ 带宽：每月 100GB（通常足够）
- ⚠️ 如果需要更多资源，可以升级到 Pro

## 检查授权状态

1. **访问 GitHub 设置**
   - https://github.com/settings/applications
   - 找到 **Authorized OAuth Apps** 或 **Installed GitHub Apps**
   - 查找 **Vercel**

2. **检查权限**
   - 确认已勾选 **Private repositories**
   - 如果没有，点击 **Configure** 添加权限

3. **重新授权（如果需要）**
   - 在 Vercel Dashboard → **Settings** → **Git**
   - 点击 **Disconnect** 然后重新连接
   - 确保勾选私有仓库权限

## 总结

- ✅ **Vercel 完全支持私有仓库**
- ✅ **免费版也支持**
- ✅ **只需授权访问私有仓库权限**
- ✅ **部署流程与公开仓库相同**

如果你的仓库是私有的，只需确保在授权时勾选了私有仓库权限即可！
