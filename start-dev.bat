@echo off
chcp 65001 >nul
echo ========================================
echo Flight Data Generator - Dev Server
echo ========================================
echo.

REM Port 5173'u kontrol et (Vite default portu)
set PORT=5173

echo [1/3] Port %PORT% kontrol ediliyor...
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul

if %errorlevel% equ 0 (
    echo ⚠ Port %PORT% kullanımda! Port boşaltılıyor...
    
    REM Port kullanan process ID'yi bul
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
        set PID=%%a
        goto :found
    )
    
    :found
    if defined PID (
        echo   Process ID: %PID%
        echo   Process sonlandırılıyor...
        taskkill /F /PID %PID% >nul 2>&1
        
        if %errorlevel% equ 0 (
            echo   ✓ Port %PORT% başarıyla boşaltıldı
            timeout /t 2 /nobreak >nul
        ) else (
            echo   ✗ Process sonlandırılamadı. Yönetici olarak çalıştırmayı deneyin.
            pause
            exit /b 1
        )
    )
) else (
    echo ✓ Port %PORT% boşta
)

echo.
echo [2/3] Node modules kontrol ediliyor...
if not exist "node_modules" (
    echo ⚠ node_modules bulunamadı. npm install çalıştırılıyor...
    call npm install
    if %errorlevel% neq 0 (
        echo ✗ npm install başarısız oldu!
        pause
        exit /b 1
    )
    echo ✓ Bağımlılıklar yüklendi
) else (
    echo ✓ node_modules mevcut
)

echo.
echo [3/3] Geliştirme sunucusu başlatılıyor...
echo.
echo ========================================
echo Sunucu hazır olduğunda tarayıcınızda:
echo   http://localhost:%PORT%/tools/flight-generator
echo ========================================
echo.
echo Durdurmak için Ctrl+C tuşlarına basın
echo.

REM Projeyi çalıştır
call npm run dev

REM Hata durumunda
if %errorlevel% neq 0 (
    echo.
    echo ✗ Sunucu başlatılamadı!
    echo.
    pause
    exit /b 1
)

