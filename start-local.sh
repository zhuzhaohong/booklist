#!/bin/bash
# 本地开发服务器 - 强制在项目目录启动

# 获取脚本的绝对路径
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || realpath "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
PROJECT_DIR="$(dirname "$SCRIPT_PATH")"

# 切换到项目目录
cd "$PROJECT_DIR" || {
    echo "❌ 无法切换到项目目录: $PROJECT_DIR"
    exit 1
}

# 显示当前目录
echo "📁 当前目录: $(pwd)"
echo ""

# 检查 index.html 是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 未找到 index.html"
    echo "当前目录内容:"
    ls -la
    exit 1
fi

echo "✅ 找到 index.html"
echo "🚀 启动服务器..."
echo "📡 访问地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

# 启动服务器
python3 -m http.server 3000
