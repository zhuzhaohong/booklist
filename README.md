# 个人数字书架（纯前端）

## 运行方式
- **直接运行**：双击打开 `index.html`（推荐用 Chrome / Edge / Safari）
- **本地服务器（可选）**：如果你更喜欢通过本地服务器打开，可使用任意静态服务器工具（例如 VSCode / Cursor 的 Live Server 插件）。

## 数据存储
- 所有书籍数据保存在浏览器 `localStorage`
- 关键 key：
  - `booklist.books`
  - `booklist.nextId`

## 主要功能
- 添加 / 编辑 / 删除书籍
- 阅读状态循环切换：想读 → 在读 → 已读 → 想读
- 评分（0–5 星）与“高评分 4+”筛选
- 顶部统计：总藏书、已读、在读

## 文件结构
- `index.html`：页面结构
- `styles.css`：样式（响应式、卡片、渐变主题）
- `app.js`：业务逻辑（渲染、事件、localStorage 持久化）
- `PRD.MD`：需求文档

