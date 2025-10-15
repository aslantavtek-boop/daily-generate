@echo off
REM Basit başlatma scripti - PowerShell versiyonunu çalıştırır

powershell -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"

if %errorlevel% neq 0 (
    echo.
    echo PowerShell script calismadi. Klasik batch versiyonu deneniyor...
    echo.
    call "%~dp0start-dev.bat"
)

