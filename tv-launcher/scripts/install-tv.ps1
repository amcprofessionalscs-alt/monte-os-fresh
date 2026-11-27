# Installs Monte TV on an Android TV / Google TV device over Wi-Fi and makes it the
# home screen. Run from a Windows PC on the same Wi-Fi as the TV, in PowerShell:
#
#   powershell -ExecutionPolicy Bypass -File .\install-tv.ps1 192.168.1.50
#
# Before running, on the TV: Settings > System > About > tap "Android TV OS build"
# 7 times, then Settings > System > Developer options > turn on USB debugging
# (and Wireless debugging if your TV has it).
param([string]$TvIp = "")

$ErrorActionPreference = "Stop"
$Pkg = "com.monteos.tvhome"
$Activity = "$Pkg/.MainActivity"
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Apk = Join-Path $Here "MonteTV.apk"

function Say($m)  { Write-Host "`n==> $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "`n$m" -ForegroundColor Red; exit 1 }

if (-not (Test-Path $Apk)) { Fail "Can't find $Apk. Keep MonteTV.apk in the same folder as this script." }
if (-not $TvIp) { $TvIp = Read-Host "TV's IP address (Settings > Network & Internet > your Wi-Fi)" }
if (-not $TvIp) { Fail "No IP address given." }

# --- 1. Get adb ---------------------------------------------------------------
$Adb = (Get-Command adb -ErrorAction SilentlyContinue).Source
if (-not $Adb) {
    $Adb = Join-Path $Here "platform-tools\adb.exe"
    if (-not (Test-Path $Adb)) {
        Say "Downloading Android platform-tools (adb) from Google"
        $Zip = Join-Path $Here "platform-tools.zip"
        Invoke-WebRequest -UseBasicParsing -OutFile $Zip `
            "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
        Expand-Archive -Force $Zip $Here
        Remove-Item $Zip
    }
}

function AdbRun { & $Adb @args 2>&1 | Out-String }
function State($t) { (AdbRun -s $t get-state).Trim() }

# --- 2. Connect over Wi-Fi ---------------------------------------------------
$Target = "${TvIp}:5555"
Say "Connecting to the TV at $Target"
Write-Host "If the TV asks 'Allow USB debugging?', tick 'Always allow' and choose OK."
AdbRun connect $Target | Write-Host
for ($i = 0; $i -lt 30 -and (State $Target) -ne "device"; $i++) {
    Start-Sleep -Seconds 2
    AdbRun connect $Target | Out-Null
}

if ((State $Target) -ne "device") {
    Write-Host @"

Couldn't connect on port 5555. Newer Google TV models use "Wireless debugging"
with a pairing code instead:
  TV: Settings > System > Developer options > Wireless debugging > turn on,
      then "Pair device with pairing code".
"@
    $PairAddr = Read-Host "Pairing IP:port shown on the TV (e.g. 192.168.1.50:37123)"
    $PairCode = Read-Host "6-digit pairing code shown on the TV"
    AdbRun pair $PairAddr $PairCode | Write-Host
    $Target = Read-Host "Now the IP:port under 'IP address & Port' on the Wireless debugging screen"
    AdbRun connect $Target | Write-Host
    Start-Sleep -Seconds 2
    if ((State $Target) -ne "device") { Fail "Still not connected. Check the TV and PC are on the same Wi-Fi." }
}
Write-Host "Connected."

# --- 3. Install ---------------------------------------------------------------
Say "Installing Monte TV"
& $Adb -s $Target install -r $Apk
if ($LASTEXITCODE -ne 0) { Fail "Install failed (see the message above)." }
AdbRun -s $Target shell appops set $Pkg SYSTEM_ALERT_WINDOW allow | Out-Null

# --- 4. Make it the home screen ----------------------------------------------
function CurrentHome {
    $out = AdbRun -s $Target shell cmd package resolve-activity --brief `
        -a android.intent.action.MAIN -c android.intent.category.HOME
    ($out.Trim() -split "`r?`n")[-1].Trim()
}

Say "Setting Monte TV as the home screen"
AdbRun -s $Target shell cmd package set-home-activity $Activity | Out-Null
$HomeNow = CurrentHome

if (-not $HomeNow.StartsWith("$Pkg/")) {
    $Stock = ""
    foreach ($p in "com.google.android.apps.tv.launcherx", "com.google.android.tvlauncher",
                   "com.google.android.leanbacklauncher") {
        if ((AdbRun -s $Target shell pm list packages -e $p) -match "package:$([regex]::Escape($p))\s") {
            $Stock = $p; break
        }
    }
    Write-Host "The TV is still using its own home screen ($HomeNow)."
    if ($Stock) {
        Write-Host @"
To make Monte TV the home screen, the TV's built-in launcher ($Stock) has to be
turned off. Nothing is deleted, and you can turn it back on any time with:
  adb connect $Target ; adb shell pm enable $Stock
While it's off, the Google TV "For you" screen and its recommendations go away;
your apps still work and are all in Monte TV's "All apps" tile.
"@
        $yn = Read-Host "Turn off the built-in launcher now? [y/N]"
        if ($yn -match '^[Yy]$') {
            AdbRun -s $Target shell pm disable-user --user 0 $Stock | Write-Host
            AdbRun -s $Target shell cmd package set-home-activity $Activity | Out-Null
            $HomeNow = CurrentHome
        }
    }
}

# --- 5. Open it ---------------------------------------------------------------
AdbRun -s $Target shell am start -n $Activity | Out-Null

if ($HomeNow.StartsWith("$Pkg/")) {
    Say "Done. Monte TV is your home screen."
    Write-Host "Press Home on the remote to check. It also opens when the TV powers on."
} else {
    Say "Installed and opened, but the TV's own home screen is still the default."
    Write-Host "Monte TV will still open after the TV restarts. You can also open it from"
    Write-Host "the Apps row. Run this script again any time to change that."
}
