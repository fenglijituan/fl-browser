@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════╗
echo ║        FL Browser 一键打包工具              ║
echo ╚══════════════════════════════════════════════╝
echo.
echo 正在执行打包流程...
echo.

echo [1/3] 安装生产依赖...
call npm install --production --no-audit --no-fund 2>nul
echo.

echo [2/3] 检查构建工具...
where electron-builder >nul 2>nul
if %errorlevel% neq 0 (
    echo 未找到全局 electron-builder，正在使用本地版本...
)
echo.

echo [3/3] 开始打包...
echo 这可能需要几分钟时间，请耐心等待...
echo.
call npm run build:zip

echo.
echo ═══════════════════════════════════════════════
if exist "dist\*.zip" (
    echo ✓ 打包完成！
    echo.
    echo 输出文件在 dist\ 目录:
    dir /b dist\*.zip
    echo.
    echo 文件大小:
    for %%F in (dist\*.zip) do (
        echo   %%~nxF - %%~zF 字节
    )
) else (
    echo ✗ 打包可能出现问题，请检查 dist\ 目录
)
echo ═══════════════════════════════════════════════
echo.
pause