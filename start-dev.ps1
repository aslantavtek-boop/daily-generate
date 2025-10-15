# Flight Data Generator - PowerShell Başlatma Scripti
# Encoding: UTF-8

$ErrorActionPreference = "Stop"
$PORT = 5173

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Flight Data Generator - Dev Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Port kontrolü
Write-Host "[1/3] Port $PORT kontrol ediliyor..." -ForegroundColor Yellow

$portInUse = Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "  ⚠ Port $PORT kullanımda!" -ForegroundColor Red
    Write-Host "  Process ID: $($portInUse.OwningProcess)" -ForegroundColor Gray
    
    $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  Process: $($process.ProcessName)" -ForegroundColor Gray
        Write-Host "  Process sonlandırılıyor..." -ForegroundColor Yellow
        
        try {
            Stop-Process -Id $portInUse.OwningProcess -Force
            Write-Host "  ✓ Port $PORT başarıyla boşaltıldı" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "  ✗ Process sonlandırılamadı. Yönetici olarak çalıştırmayı deneyin." -ForegroundColor Red
            Read-Host "Devam etmek için Enter'a basın"
            exit 1
        }
    }
} else {
    Write-Host "  ✓ Port $PORT boşta" -ForegroundColor Green
}

Write-Host ""

# Node modules kontrolü
Write-Host "[2/3] Node modules kontrol ediliyor..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  ⚠ node_modules bulunamadı. npm install çalıştırılıyor..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "  ✓ Bağımlılıklar yüklendi" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ npm install başarısız oldu!" -ForegroundColor Red
        Read-Host "Devam etmek için Enter'a basın"
        exit 1
    }
} else {
    Write-Host "  ✓ node_modules mevcut" -ForegroundColor Green
}

Write-Host ""

# Sunucuyu başlat
Write-Host "[3/3] Geliştirme sunucusu başlatılıyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sunucu hazır olduğunda tarayıcınızda:" -ForegroundColor White
Write-Host "  http://localhost:$PORT/tools/flight-generator" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Durdurmak için Ctrl+C tuşlarına basın" -ForegroundColor Gray
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "✗ Sunucu başlatılamadı!" -ForegroundColor Red
    Write-Host ""
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

