@echo off
setlocal
title Brownie Website - Local Preview
cd /d "%~dp0"

if not exist "%~dp0scripts\preview-website.py" (
  echo Cannot find scripts\preview-website.py. Keep this file in the project folder.
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
py -3 "%~dp0scripts\preview-website.py" %*
set "BROWNIE_PREVIEW_EXIT=%ERRORLEVEL%"
goto finished

:use_python
python "%~dp0scripts\preview-website.py" %*
set "BROWNIE_PREVIEW_EXIT=%ERRORLEVEL%"

:finished
if not "%BROWNIE_PREVIEW_EXIT%"=="0" pause
exit /b %BROWNIE_PREVIEW_EXIT%
