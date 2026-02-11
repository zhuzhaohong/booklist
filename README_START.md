# 🚀 快速启动本地服务器

## ⚠️ 重要：先停止旧服务器

如果之前启动过服务器，请先停止：

```bash
# 停止所有占用 3000 端口的进程
lsof -ti:3000 | xargs kill -9
```

## ✅ 正确的启动方式

### 方法 1：使用脚本（推荐）

```bash
cd /Users/tumusen/Desktop/tumusen/booklist
./start-local.sh
```

### 方法 2：手动启动（确保在项目目录）

```bash
# 1. 先进入项目目录
cd /Users/tumusen/Desktop/tumusen/booklist

# 2. 确认目录正确（应该能看到 index.html）
ls index.html

# 3. 启动服务器
python3 -m http.server 3000
```

### 方法 3：一行命令

```bash
cd /Users/tumusen/Desktop/tumusen/booklist && python3 -m http.server 3000
```

## 🔍 验证服务器是否在正确目录

启动后，访问 http://localhost:3000，应该看到：
- ✅ 你的书架应用界面（有"个人数字书架"标题）
- ❌ 不应该看到目录列表

如果看到目录列表，说明服务器启动在了错误的目录。

## 🛑 停止服务器

在运行服务器的终端窗口按 `Ctrl+C`

或使用命令：
```bash
lsof -ti:3000 | xargs kill -9
```
