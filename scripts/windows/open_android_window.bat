@echo off
setlocal
echo ========================================================
echo   Launching Water Tracker - Android Live Window (scrcpy)
echo ========================================================
where scrcpy >nul 2>&1
if errorlevel 1 (
  echo scrcpy was not found on PATH.
  exit /b 1
)
set "DEVICE_SERIAL=%~1"
if not defined DEVICE_SERIAL set "DEVICE_SERIAL=emulator-5554"
scrcpy -s "%DEVICE_SERIAL%" --video-codec=h264 -m 1024 --no-audio --window-title "Water Tracker - Android Window" --always-on-top
