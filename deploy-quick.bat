@echo off
REM Quick deploy without prompts - uses default commit message

echo Building and deploying...
call npm run build && git add . && git commit -m "Quick deploy update" && git push origin feat/load-excel-from-daily

if errorlevel 1 (
    echo Deployment failed!
    pause
) else (
    echo Deployment successful!
    echo Check: https://github.com/aslantavtek-boop/daily-generate/actions
    timeout /t 5
)

