$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList @(
    '-NoLogo',
    '-Command',
    "Set-Location '$root\\server'; pnpm --filter ./server start"
)

Start-Process powershell -ArgumentList @(
    '-NoLogo',
    '-Command',
    "Set-Location '$root\\front'; pnpm dev"
)
