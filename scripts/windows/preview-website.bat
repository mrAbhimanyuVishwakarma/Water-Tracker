@echo off
setlocal
title Brownie Website - Local Preview
cd /d "%~dp0..\.."
set "BROWNIE_PREVIEW_SCRIPT=%~dp0..\dev\preview-website.py"

if not exist "%BROWNIE_PREVIEW_SCRIPT%" (
  echo Cannot find scripts\dev\preview-website.py. Keep this launcher in scripts\windows.
  pause
  exit /b 1
)

py -3 -c "import http.server" >nul 2>&1
if not errorlevel 1 goto use_py

python -c "import http.server" >nul 2>&1
if not errorlevel 1 goto use_python

echo Python 3 is needed to preview the website.
echo Install it from https://www.python.org/downloads/ and try again.
pause
exit /b 1

:use_py
py -3 "%BROWNIE_PREVIEW_SCRIPT%" %*
set "BROWNIE_PREVIEW_EXIT=%ERRORLEVEL%"
goto finished

:use_python
python "%BROWNIE_PREVIEW_SCRIPT%" %*
set "BROWNIE_PREVIEW_EXIT=%ERRORLEVEL%"

:finished
if not "%BROWNIE_PREVIEW_EXIT%"=="0" pause
exit /b %BROWNIE_PREVIEW_EXIT%
