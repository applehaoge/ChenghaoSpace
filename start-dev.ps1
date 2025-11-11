$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Join-Path $root 'server'
$frontDir = Join-Path $root 'front'
$runnerDir = Join-Path $root 'python-runner'
$memoryDir = Join-Path $root 'server_data\memory'

if (-not (Test-Path -LiteralPath $memoryDir)) {
    New-Item -ItemType Directory -Path $memoryDir -Force | Out-Null
}

$env:MEMORY_STORE_DIR = $memoryDir
if (-not $env:RUNNER_SERVER_URL) {
    $env:RUNNER_SERVER_URL = 'http://127.0.0.1:8000'
}

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

if (Test-Path -LiteralPath $runnerDir) {
    Start-Process powershell -ArgumentList @(
        '-NoLogo',
        '-NoProfile',
        '-NoExit',
        '-Command',
        "Set-Location -LiteralPath '$runnerDir'; pnpm dev"
    )
}
