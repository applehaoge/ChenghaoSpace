$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Running server unit tests..." -ForegroundColor Cyan
pnpm --dir (Join-Path $root 'server') test
if ($LASTEXITCODE -ne 0) {
    Write-Host "Server tests failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Building front-end (smoke build)..." -ForegroundColor Cyan
pnpm --dir (Join-Path $root 'front') build:client
if ($LASTEXITCODE -ne 0) {
    Write-Host "Front-end build failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Smoke checks completed successfully." -ForegroundColor Green
