@echo off
setlocal

if "%~1"=="" (
    echo Error: Please provide a version number
    echo Usage: push_version.cmd version "Your version message here"
    exit /b 1
)

if "%~2"=="" (
    echo Error: Please provide a version message
    echo Usage: push_version.cmd version "Your version message here"
    exit /b 1
)

echo Pushing changes to git...
git add .
git commit -m "feat: %~2"
git tag -a %~1 -m "%~2"
git push origin main
git push origin %~1
echo Done.
pause

