@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

REM AEROCHECK - Start script
REM Lancer le backend et le frontend simultanement

echo =========================================
echo   AEROCHECK - Demarrage des services
echo =========================================
echo.

REM Colors
set "GREEN=[32m"
set "BLUE=[34m"
set "YELLOW=[33m"
set "NC=[0m"

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%❌ npm n'est pas installe%NC%
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Get script directory
cd /d "%~dp0"

set "BACKEND_PORT=3010"
set "FRONTEND_PORT=3300"

echo %GREEN%🚀 Demarrage du Backend (localhost:%BACKEND_PORT%)...%NC%
start "AEROCHECK Backend" cmd /c "cd /d "%~dp0backend" && npm install --silent 2>nul && set PORT=%BACKEND_PORT% && npm run dev"

echo %GREEN%🚀 Demarrage du Frontend (localhost:%FRONTEND_PORT%)...%NC%
timeout /t 3 /nobreak >nul
start "AEROCHECK Frontend" cmd /c "cd /d "%~dp0frontend" && npm install --silent 2>nul && npm run dev -- --host 0.0.0.0 --port %FRONTEND_PORT%"

echo.
echo =========================================
echo %GREEN%✅ Services demarres avec succes!%NC%
echo =========================================
echo.
echo 📱 Frontend: %YELLOW%http://localhost:%FRONTEND_PORT%%NC%
echo 🔌 Backend:   %YELLOW%http://localhost:%BACKEND_PORT%%NC%
echo.
echo 💡 %YELLOW%Comptes de demo (mot de passe: password123):%NC%
echo    • admin@aerocheck.com (Super Admin)
echo    • qip1@aerocheck.com (QIP)
echo    • dlaa1@aerocheck.com (DLAA)
echo    • agent1@test.com (Agent)
echo.
echo ⚠️  %YELLOW%Fermez les fenetres CMD pour arreter les services%NC%
echo.

echo Les services sont demarres dans des fenetres separees.
pause
