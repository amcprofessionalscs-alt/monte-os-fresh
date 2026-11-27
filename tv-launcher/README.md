# Monte TV — Android TV home screen

A home screen app for Android TV / Google TV sticks (built for the onn 4K stick).
It opens when the TV powers on, takes over the Home button, and shows big tiles you
move between with the remote's arrow buttons. The selected tile gets a thick yellow
ring and zooms in slightly.

- **House Board** and **Jarvis** open full screen. Back returns to the tiles.
- **All apps** lists every app on the TV (Netflix, YouTube, …) so nothing is lost.
- **Settings** opens the TV's settings (Wi-Fi, display, remote).
- A live clock and date sit in the top-right corner.

A page that fails to load (for example, after a Wi-Fi drop) shows a message, retries
on its own every 30 seconds, and retries right away when you press OK.

## Install on the TV over Wi-Fi

You need a Mac, Windows or Linux computer on the **same Wi-Fi as the TV**.

1. **On the TV**, turn on developer mode: Settings → System → About → select
   **Android TV OS build** 7 times until it says you're a developer.
2. Settings → System → **Developer options** → turn on **USB debugging**. If you see
   **Wireless debugging**, turn that on too.
3. Note the TV's IP address: Settings → Network & Internet → your Wi-Fi network.
4. **On the computer**, put `MonteTV.apk` and the install script in one folder and run:
   - Mac / Linux: `./install-tv.sh 192.168.1.50`
   - Windows (PowerShell): `powershell -ExecutionPolicy Bypass -File .\install-tv.ps1 192.168.1.50`

   Use your TV's IP address. The script downloads `adb` if needed, connects, installs
   the app and makes it the home screen.
5. When the TV asks **Allow USB debugging?**, tick **Always allow** and select OK.

### About the home screen on Google TV

Google TV doesn't let another app take over Home while its own launcher is on. If the
script finds that, it asks before turning the built-in launcher off. Nothing is
deleted, and you can turn it back on any time:

```bash
adb connect <tv-ip>:5555
adb shell pm enable com.google.android.apps.tv.launcherx
```

While it's off, the Google TV "For you" screen goes away. All your apps still work and
are in the **All apps** tile. If you choose not to turn it off, Monte TV still opens
by itself after the TV restarts, and you can open it from the Apps row.

## Add or change tiles

Tiles are listed in [`app/src/main/assets/tiles.json`](app/src/main/assets/tiles.json):

```json
{ "type": "web", "title": "House Board", "subtitle": "…", "glyph": "H",
  "url": "https://claude.ai/artifact/…" }
```

| `type`     | What it does                       | Extra fields            |
|------------|------------------------------------|-------------------------|
| `web`      | Opens a web page full screen       | `url`                   |
| `app`      | Opens an installed app             | `package`, e.g. `com.netflix.ninja` |
| `apps`     | Shows every installed app          |                         |
| `settings` | Opens the TV's settings            |                         |

`glyph` is the letter in the yellow circle (it defaults to the first letter of the
title). `"columns": 2` at the top sets tiles per row. Two rows fill the screen and
more rows scroll.

**Without rebuilding:** edit a copy of `tiles.json` and push it to the TV. The home
screen picks it up the next time it's shown:

```bash
adb push tiles.json /sdcard/Android/data/com.monteos.tvhome/files/tiles.json
```

To go back to the built-in tiles:

```bash
adb shell rm /sdcard/Android/data/com.monteos.tvhome/files/tiles.json
```

## Build

You need JDK 17+ and the Android SDK (platform 35). Then:

```bash
./gradlew assembleDebug
```

The APK is written to `app/build/outputs/apk/debug/app-debug.apk`. Rename it to
`MonteTV.apk` next to the install scripts.

A debug build is signed with your machine's debug key. An APK built on a different
machine has a different key, so installing it over this one fails until you uninstall
the old copy (`adb uninstall com.monteos.tvhome`).
