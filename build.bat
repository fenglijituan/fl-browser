@echo off
echo Building FL Browser...
echo.
call npm run build:zip
echo.
echo Build complete! Check dist/ folder.
pause
