param([switch]$SkipInstall)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
function Fail($message) { Write-Host "`nLOI: $message" -ForegroundColor Red; exit 1 }
function Run($exe, $arguments) {
  & $exe @arguments
  if ($LASTEXITCODE -ne 0) { Fail "$exe $($arguments -join ' ') that bai. Ma loi: $LASTEXITCODE" }
}
Write-Host "=== NANG HOA POS V5.1 - LOCAL QUICK START ===" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Chua cai Node.js 22+. Hay cai Node.js roi mo lai PowerShell." }
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { Fail "Khong tim thay npm." }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { Fail "Chua cai Docker Desktop. Can Docker Desktop de khoi tao PostgreSQL local." }
& docker info *> $null
if ($LASTEXITCODE -ne 0) { Fail "Docker Desktop chua chay. Mo Docker Desktop, cho khoi dong xong va thu lai." }
$backendEnv = Join-Path $PSScriptRoot 'backend\.env'
if (-not (Test-Path $backendEnv)) {
  $adminPass = Read-Host "Nhap MAT KHAU ADMIN moi (khong dung mat khau cong khai)"
  $userPass = Read-Host "Nhap MAT KHAU USER moi"
  if ($adminPass.Length -lt 8 -or $userPass.Length -lt 8) { Fail "Moi mat khau phai co it nhat 8 ky tu." }
  $secret = -join (1..64 | ForEach-Object { 'abcdef0123456789'[(Get-Random -Maximum 16)] })
  $envText = Get-Content (Join-Path $PSScriptRoot 'backend\.env.local.example') -Raw
  $envText = $envText.Replace('CHANGE_TO_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS', $secret)
  $envText = $envText.Replace('CHANGE_ADMIN_PASSWORD', $adminPass.Replace('\','\\').Replace('"','\"'))
  $envText = $envText.Replace('CHANGE_USER_PASSWORD', $userPass.Replace('\','\\').Replace('"','\"'))
  Set-Content -Path $backendEnv -Value $envText -Encoding UTF8
  Write-Host "Da tao backend\.env (KHONG day file nay len GitHub)." -ForegroundColor Green
}
$frontEnv = Join-Path $PSScriptRoot 'frontend\.env.local'
if (-not (Test-Path $frontEnv)) { Copy-Item 'frontend\.env.local.example' $frontEnv }
Write-Host "`n[1/6] Khoi dong PostgreSQL..." -ForegroundColor Yellow
Run docker @('compose','up','-d','db')
Write-Host "[2/6] Cho PostgreSQL san sang..." -ForegroundColor Yellow
$ready=$false
for ($i=0;$i -lt 30;$i++) {
  & docker compose exec -T db pg_isready -U nanghoa -d nanghoa *> $null
  if ($LASTEXITCODE -eq 0) { $ready=$true; break }
  Start-Sleep -Seconds 2
}
if (-not $ready) { Fail "PostgreSQL chua san sang. Kiem tra: docker compose logs db" }
if (-not $SkipInstall) {
  Write-Host "[3/6] Cai thu vien Backend..." -ForegroundColor Yellow
  Push-Location backend
  try { Run npm.cmd @('install') } finally { Pop-Location }
} else { Write-Host "[3/6] Bo qua npm install Backend." }
Push-Location backend
try {
  Write-Host "[4/6] Prisma validate, generate, db push..." -ForegroundColor Yellow
  Run npx.cmd @('prisma','validate')
  Run npx.cmd @('prisma','generate')
  Run npx.cmd @('prisma','db','push')
  Write-Host "[5/6] Build Backend..." -ForegroundColor Yellow
  Run npm.cmd @('run','build')
} finally { Pop-Location }
if (-not $SkipInstall) {
  Push-Location frontend
  try { Run npm.cmd @('install') } finally { Pop-Location }
}
Write-Host "[6/6] Mo Backend va Frontend o hai cua so PowerShell..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot 'backend'
$frontendPath = Join-Path $PSScriptRoot 'frontend'
Start-Process powershell.exe -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command',"Set-Location '$backendPath'; npm.cmd run start:dev")
Start-Sleep -Seconds 5
Start-Process powershell.exe -ArgumentList @('-NoExit','-ExecutionPolicy','Bypass','-Command',"Set-Location '$frontendPath'; npm.cmd run dev")
Write-Host "`nMo: http://localhost:5173" -ForegroundColor Green
Write-Host "Kiem tra API: http://localhost:3000/api/health"
Write-Host "Neu Failed to fetch: kiem tra hai cua so PowerShell va dia chi API." -ForegroundColor Yellow
