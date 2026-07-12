@echo off
echo OCBP Racer - Building Standalone Package
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Cleaning dist/...
if exist dist rmdir /s /q dist

echo [2/4] Building with Vite...
call npx vite build
if %errorlevel% neq 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)

echo [3/4] Copying GLTF models...
if not exist dist\assets\models mkdir dist\assets\models
xcopy /s /e /q assets\models\* dist\assets\models\

echo [4/4] Done!
echo.
echo Standalone build ready in dist/
echo Run dist\serve.bat to start the server.
echo.
pause
