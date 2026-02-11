#!/bin/bash
# 快速启动脚本 - 确保在项目目录中启动服务器

cd "$(dirname "$0")" || exit 1
python3 -m http.server 3000
