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
    $env:RUNNER_SERVER_URL = 'http://127.0.0.1:8302'
}

function Wait-ServerPort {
    param (
        [string]$Host,
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )

    if (-not $Host -or -not $Port) {
        return
    }

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    Write-Host ("Waiting for server {0}:{1} ..." -f $Host, $Port)
    while ((Get-Date) -lt $deadline) {
        try {
            $test = Test-NetConnection -ComputerName $Host -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($test) {
                Write-Host ("Server port {0}:{1} is ready." -f $Host, $Port)
                return
            }
        } catch {
            # ignore and retry
        }
        Start-Sleep -Seconds 1
    }

    Write-Warning ("Timed out waiting for {0}:{1}. Runner will still start and keep retrying." -f $Host, $Port)
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

try {
    $serverUri = [System.Uri]$env:RUNNER_SERVER_URL
    Wait-ServerPort -Host $serverUri.DnsSafeHost -Port $serverUri.Port
} catch {
    # fallback wait a short moment if parsing fails
    Start-Sleep -Seconds 3
}

if (Test-Path -LiteralPath $runnerDir) {
    Start-Process powershell -ArgumentList @(
        '-NoLogo',
        '-NoProfile',
        '-NoExit',
        '-Command',
        "Set-Location -LiteralPath '$runnerDir'; pnpm dev"
    )
}
