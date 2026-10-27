@echo off
echo ========================================================
echo   Launching Water Tracker - Android Live Window (scrcpy)
echo ========================================================
"C:\Users\abhim\AppData\Local\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbwe\scrcpy-win64-v5.0.1\scrcpy.exe" -s emulator-5554 --video-codec=h264 --video-encoder=c2.android.avc.encoder -m 1024 --no-audio --window-title "Water Tracker - Android Window" --always-on-top
