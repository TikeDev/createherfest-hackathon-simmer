@echo off
REM Launch Chrome with remote debugging for MCP server connection
REM Usage: launch-chrome-beta.bat [--fresh] [URL]

SET CHROME_BETA_PATH=C:\Program Files\Google\Chrome Beta\Application\chrome.exe
SET CHROME_STABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
SET PROFILE_DIR=%USERPROFILE%\.simmer-chrome-debug
SET DEFAULT_URL=http://localhost:5173
SET TARGET_URL=%DEFAULT_URL%
SET USE_FRESH=false
SET CHROME_PATH=

REM Parse arguments
FOR %%A IN (%*) DO (
  IF "%%A"=="--fresh" SET USE_FRESH=true
  IF "%%A" NEQ "--fresh" IF NOT "%%A"=="" SET TARGET_URL=%%A
)

REM Pick whichever Chrome is available (Beta preferred)
IF EXIST "%CHROME_BETA_PATH%" (
  SET CHROME_PATH=%CHROME_BETA_PATH%
) ELSE IF EXIST "%CHROME_STABLE_PATH%" (
  SET CHROME_PATH=%CHROME_STABLE_PATH%
  echo Warning: Chrome Beta not found, using Chrome stable
) ELSE (
  echo No Chrome installation found. Install from: https://www.google.com/chrome/
  exit /b 1
)

IF "%USE_FRESH%"=="true" (
  SET PROFILE_DIR=%TEMP%\simmer-debug-profile
  echo Using temporary profile
) ELSE (
  echo Using persistent profile at %PROFILE_DIR%
)

echo Launching Chrome with remote debugging on port 9222...
echo Opening: %TARGET_URL%

"%CHROME_PATH%" ^
  --remote-debugging-port=9222 ^
  --user-data-dir="%PROFILE_DIR%" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-default-apps ^
  %TARGET_URL%
