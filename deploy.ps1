#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FMS Daily - GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if there are uncommitted changes
Write-Host "Current git status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Get commit message from user
$commitMsg = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update and deploy to GitHub Pages"
}

Write-Host ""
Write-Host "[1/4] Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Adding changes to git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Changes staged" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
git commit -m $commitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ No changes to commit or commit failed" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin feat/load-excel-from-daily
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Push completed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "GitHub Actions will now build and deploy your site." -ForegroundColor White
Write-Host "Check the progress at: " -NoNewline -ForegroundColor White
Write-Host "https://github.com/aslantavtek-boop/daily-generate/actions" -ForegroundColor Blue
Write-Host ""
Write-Host "Your site will be available at:" -ForegroundColor White
Write-Host "https://aslantavtek-boop.github.io/daily-generate/" -ForegroundColor Blue
Write-Host ""

Read-Host "Press Enter to exit"

