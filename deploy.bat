@echo off
echo ========================================
echo   FMS Daily - GitHub Pages Deployment
echo ========================================
echo.

REM Check if there are uncommitted changes
git status --short
echo.

REM Get commit message from user
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update and deploy to GitHub Pages

echo.
echo [1/4] Building project...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully
echo.

echo [2/4] Adding changes to git...
git add .
echo ✓ Changes staged
echo.

echo [3/4] Committing changes...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo No changes to commit or commit failed
)
echo.

echo [4/4] Pushing to GitHub...
git push origin feat/load-excel-from-daily
if errorlevel 1 (
    echo ERROR: Push failed!
    pause
    exit /b 1
)
echo ✓ Push completed successfully
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo GitHub Actions will now build and deploy your site.
echo Check the progress at: https://github.com/aslantavtek-boop/daily-generate/actions
echo.
echo Your site will be available at:
echo https://aslantavtek-boop.github.io/daily-generate/
echo.

pause

