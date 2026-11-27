#!/usr/bin/env bash
# Installs Monte TV on an Android TV / Google TV device over Wi-Fi and makes it the
# home screen. Run from a Mac or Linux computer on the same Wi-Fi as the TV:
#
#   ./install-tv.sh 192.168.1.50
#
# Before running, on the TV: Settings > System > About > tap "Android TV OS build"
# 7 times, then Settings > System > Developer options > turn on USB debugging
# (and Wireless debugging if your TV has it).
set -euo pipefail

PKG="com.monteos.tvhome"
ACTIVITY="$PKG/.MainActivity"
HERE="$(cd "$(dirname "$0")" && pwd)"
APK="${APK:-$HERE/MonteTV.apk}"

say()  { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

[ -f "$APK" ] || fail "Can't find $APK. Keep MonteTV.apk in the same folder as this script."

TV_IP="${1:-}"
if [ -z "$TV_IP" ]; then
  read -r -p "TV's IP address (Settings > Network & Internet > your Wi-Fi): " TV_IP
fi
[ -n "$TV_IP" ] || fail "No IP address given."

# --- 1. Get adb ---------------------------------------------------------------
if command -v adb >/dev/null 2>&1; then
  ADB="adb"
elif [ -x "$HERE/platform-tools/adb" ]; then
  ADB="$HERE/platform-tools/adb"
else
  say "Downloading Android platform-tools (adb) from Google"
  case "$(uname -s)" in
    Darwin) OS=darwin ;;
    Linux)  OS=linux ;;
    *) fail "Unsupported system. On Windows, use install-tv.ps1 instead." ;;
  esac
  curl -fsSL -o "$HERE/platform-tools.zip" \
    "https://dl.google.com/android/repository/platform-tools-latest-$OS.zip"
  unzip -q -o "$HERE/platform-tools.zip" -d "$HERE"
  rm -f "$HERE/platform-tools.zip"
  ADB="$HERE/platform-tools/adb"
fi

# --- 2. Connect over Wi-Fi ---------------------------------------------------
TARGET="$TV_IP:5555"
say "Connecting to the TV at $TARGET"
echo "If the TV asks 'Allow USB debugging?', tick 'Always allow' and choose OK."
"$ADB" connect "$TARGET" || true

state() { "$ADB" -s "$TARGET" get-state 2>/dev/null || true; }
for _ in $(seq 1 30); do
  [ "$(state)" = "device" ] && break
  sleep 2
  "$ADB" connect "$TARGET" >/dev/null 2>&1 || true
done

if [ "$(state)" != "device" ]; then
  cat <<'MSG'

Couldn't connect on port 5555. Newer Google TV models use "Wireless debugging"
with a pairing code instead:
  TV: Settings > System > Developer options > Wireless debugging > turn on,
      then "Pair device with pairing code".
MSG
  read -r -p "Pairing IP:port shown on the TV (e.g. 192.168.1.50:37123): " PAIR_ADDR
  read -r -p "6-digit pairing code shown on the TV: " PAIR_CODE
  "$ADB" pair "$PAIR_ADDR" "$PAIR_CODE"
  read -r -p "Now the IP:port under 'IP address & Port' on the Wireless debugging screen: " TARGET
  "$ADB" connect "$TARGET"
  sleep 2
  [ "$(state)" = "device" ] || fail "Still not connected. Check the TV and laptop are on the same Wi-Fi."
fi
echo "Connected."

# --- 3. Install ---------------------------------------------------------------
say "Installing Monte TV"
"$ADB" -s "$TARGET" install -r "$APK"

# Lets Monte TV open itself after a reboot even if the TV keeps its own launcher.
"$ADB" -s "$TARGET" shell appops set "$PKG" SYSTEM_ALERT_WINDOW allow >/dev/null 2>&1 || true

# --- 4. Make it the home screen ----------------------------------------------
current_home() {
  "$ADB" -s "$TARGET" shell cmd package resolve-activity --brief \
    -a android.intent.action.MAIN -c android.intent.category.HOME 2>/dev/null \
    | tr -d '\r' | tail -n 1
}

say "Setting Monte TV as the home screen"
"$ADB" -s "$TARGET" shell cmd package set-home-activity "$ACTIVITY" >/dev/null 2>&1 || true

HOME_NOW="$(current_home)"
if [[ "$HOME_NOW" != "$PKG/"* ]]; then
  # Google TV / Android TV won't let another app take over Home while the stock
  # launcher is enabled. Turning that launcher off (reversible) hands Home to Monte TV.
  STOCK=""
  for p in com.google.android.apps.tv.launcherx com.google.android.tvlauncher \
           com.google.android.leanbacklauncher; do
    if "$ADB" -s "$TARGET" shell pm list packages -e "$p" 2>/dev/null | tr -d '\r' | grep -qx "package:$p"; then
      STOCK="$p"; break
    fi
  done
  echo "The TV is still using its own home screen ($HOME_NOW)."
  if [ -n "$STOCK" ]; then
    cat <<MSG
To make Monte TV the home screen, the TV's built-in launcher ($STOCK) has to be
turned off. Nothing is deleted, and you can turn it back on any time with:
  adb connect $TARGET && adb shell pm enable $STOCK
While it's off, the Google TV "For you" screen and its recommendations go away;
your apps still work and are all in Monte TV's "All apps" tile.
MSG
    read -r -p "Turn off the built-in launcher now? [y/N] " yn
    if [[ "$yn" =~ ^[Yy]$ ]]; then
      "$ADB" -s "$TARGET" shell pm disable-user --user 0 "$STOCK"
      "$ADB" -s "$TARGET" shell cmd package set-home-activity "$ACTIVITY" >/dev/null 2>&1 || true
      HOME_NOW="$(current_home)"
    fi
  fi
fi

# --- 5. Open it ---------------------------------------------------------------
"$ADB" -s "$TARGET" shell am start -n "$ACTIVITY" >/dev/null

if [[ "$HOME_NOW" == "$PKG/"* ]]; then
  say "Done. Monte TV is your home screen."
  echo "Press Home on the remote to check. It also opens when the TV powers on."
else
  say "Installed and opened, but the TV's own home screen is still the default."
  echo "Monte TV will still open after the TV restarts. You can also open it from"
  echo "the Apps row. Run this script again any time to change that."
fi
