@echo off
setlocal
echo ========================================================
echo   Launching Google Pixel Android Emulator GUI Window
echo ========================================================
set "ANDROID_SDK=%ANDROID_HOME%"
if not defined ANDROID_SDK set "ANDROID_SDK=%ANDROID_SDK_ROOT%"
if not defined ANDROID_SDK (
  echo Set ANDROID_HOME or ANDROID_SDK_ROOT before running this script.
  exit /b 1
)
set "AVD_NAME=%~1"
if not defined AVD_NAME set "AVD_NAME=Pixel_10_Pro"
start "" "%ANDROID_SDK%\emulator\emulator.exe" -avd "%AVD_NAME%"
