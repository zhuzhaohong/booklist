#!/bin/bash
# 本地开发服务器启动脚本
# 使用方法: ./dev-server.sh 或 bash dev-server.sh

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR" || exit 1

PORT=3000
echo "🚀 启动本地开发服务器..."
echo "📁 项目目录: $SCRIPT_DIR"
echo "📡 访问地址: http://localhost:$PORT"
echo "按 Ctrl+C 停止服务器"
echo ""

# 检查 index.html 是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 未找到 index.html 文件"
    echo "当前目录: $(pwd)"
    exit 1
fi

# 优先使用 Python 3（macOS 通常已预装）
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器"
    python3 -m http.server $PORT
# 降级到 Python 2
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器"
    python -m SimpleHTTPServer $PORT
else
    echo "❌ 未找到 Python"
    echo "macOS 通常已预装 Python 3，如果未找到，请："
    echo "  1. 检查 PATH 环境变量"
    echo "  2. 或安装 Python: https://www.python.org/"
    exit 1
fi
