# Build script for My Home installer
# Prepares the application and compiles the installer with Inno Setup

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  My Home - Installer Build" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check we are in the correct directory
if (-not (Test-Path "installer\setup.iss")) {
    Write-Host "ERROR: This script must be run from the project root" -ForegroundColor Red
    exit 1
}

# Check that Inno Setup is installed
$InnoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $InnoSetupPath)) {
    Write-Host "ERROR: Inno Setup is not installed!" -ForegroundColor Red
    Write-Host "Download it from: https://jrsoftware.org/isdl.php" -ForegroundColor Yellow
    Write-Host "Install Inno Setup 6 then run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to open download page"
    Start-Process "https://jrsoftware.org/isdl.php"
    exit 1
}

Write-Host "SUCCESS: Inno Setup detected" -ForegroundColor Green
Write-Host ""

# Step 1: Clean previous builds
Write-Host "Step 1/5: Cleaning previous builds..." -ForegroundColor Cyan
if (Test-Path "frontend\dist") {
    Remove-Item -Recurse -Force "frontend\dist"
    Write-Host "   frontend/dist directory removed" -ForegroundColor Gray
}
if (Test-Path "dist-installer") {
    Remove-Item -Recurse -Force "dist-installer"
    Write-Host "   dist-installer directory removed" -ForegroundColor Gray
}
Write-Host "SUCCESS: Cleaning completed" -ForegroundColor Green
Write-Host ""

# Step 2: Install frontend dependencies
Write-Host "Step 2/5: Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location -Path "frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}
Write-Host "SUCCESS: Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build frontend in production mode
Write-Host "Step 3/5: Building Angular frontend..." -ForegroundColor Cyan
npm run build:frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build frontend" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}
Write-Host "SUCCESS: Frontend built successfully" -ForegroundColor Green
Set-Location -Path ".."
Write-Host ""

# Step 4: Verify the build
Write-Host "Step 4/5: Verifying build..." -ForegroundColor Cyan
if (-not (Test-Path "frontend\dist\my-home\browser\index.html")) {
    Write-Host "ERROR: Frontend build failed (index.html not found)" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Build verified" -ForegroundColor Green
Write-Host ""

# Step 5: Compile installer with Inno Setup
Write-Host "Step 5/5: Compiling installer..." -ForegroundColor Cyan
Write-Host "WARNING: This step may take a few seconds..." -ForegroundColor Yellow

& $InnoSetupPath "installer\setup.iss"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to compile installer" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  SUCCESS: Installer created!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Display created file
$InstallerFile = Get-ChildItem -Path "dist-installer\MyHome-Setup-*.exe" | Select-Object -First 1
if ($InstallerFile) {
    $FileSize = [math]::Round($InstallerFile.Length / 1MB, 2)
    Write-Host "File: $($InstallerFile.Name)" -ForegroundColor Cyan
    Write-Host "Size: $FileSize MB" -ForegroundColor Cyan
    Write-Host "Location: $($InstallerFile.FullName)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The installer is ready for distribution!" -ForegroundColor Green
    Write-Host ""
    
    # Offer to open folder
    $Open = Read-Host "Would you like to open the installer folder? (Y/N)"
    if ($Open -eq "Y" -or $Open -eq "y") {
        Start-Process "explorer.exe" -ArgumentList "/select,`"$($InstallerFile.FullName)`""
    }
} else {
    Write-Host "WARNING: Installer file not found in dist-installer/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To install My Home, double-click the .exe file" -ForegroundColor Yellow
Write-Host ""
