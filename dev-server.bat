@echo off
REM Windows 本地开发服务器启动脚本
REM 使用方法: 双击 dev-server.bat 文件

set PORT=3000
echo 🚀 启动本地开发服务器...
echo 📡 访问地址: http://localhost:%PORT%
echo 按 Ctrl+C 停止服务器
echo.

REM 优先使用 Python 3
where python3 >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ 使用 Python 3 启动服务器
    python3 -m http.server %PORT%
    goto :end
)

REM 降级到 Python
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo ✅ 使用 Python 启动服务器
    python -m http.server %PORT%
    goto :end
)

echo ❌ 未找到 Python
echo 请安装 Python 3: https://www.python.org/
pause
:end
