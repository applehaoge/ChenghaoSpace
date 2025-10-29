$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root 'server'
$frontDir = Join-Path $root 'front'
$memoryDir = Join-Path $root 'server_data\memory'

if (-not (Test-Path -LiteralPath $memoryDir)) {
    New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
}

$env:MEMORY_STORE_DIR = $memoryDir

Start-Process powershell -ArgumentList @(
    '-NoLogo',
    '-NoProfile',
    '-NoExit',
    '-Command',
    "pnpm --dir '$serverDir' dev"
)

Start-Process powershell -ArgumentList @(
    '-NoLogo',
    '-NoProfile',
    '-NoExit',
    '-Command',
    "Set-Location -LiteralPath '$frontDir'; pnpm dev"
)
