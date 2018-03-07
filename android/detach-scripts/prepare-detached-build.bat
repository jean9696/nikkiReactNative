SET /P STOREDPATH=<"%USERPROFILE%\.expo\PATH"
SET PATH="\"%PATH%;%STOREDPATH%\""
cd C:\Program Files\nodejs\ && exp prepare-detached-build --platform android ..
