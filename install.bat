@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo   AEROCHECK - Clean Install Script
echo ========================================
echo.

REM Colors (ANSI escape codes for Windows 10+)
set "YELLOW=[33m"
set "GREEN=[32m"
set "RED=[31m"
set "NC=[0m"

REM Get script directory
cd /d "%~dp0"

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ npm n'est pas installé%NC%
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo %YELLOW%[1/6]%NC% Suppression des node_modules...
if exist "backend\node_modules" rmdir /s /q "backend\node_modules" 2>nul
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules" 2>nul
if exist "client\node_modules" rmdir /s /q "client\node_modules" 2>nul
if exist "node_modules" rmdir /s /q "node_modules" 2>nul
if exist "backend\dist" rmdir /s /q "backend\dist" 2>nul
if exist "frontend\dist" rmdir /s /q "frontend\dist" 2>nul
echo %GREEN%✓%NC% node_modules supprimés

echo.
echo %YELLOW%[2/6]%NC% Installation des dependances backend...
cd backend
call npm install
if errorlevel 1 (
    echo %RED%❌ Erreur lors de l'installation du backend%NC%
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓%NC% Backend dependencies installees

echo.
echo %YELLOW%[3/6]%NC% Installation des dependances frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo %RED%❌ Erreur lors de l'installation du frontend%NC%
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓%NC% Frontend dependencies installees

echo.
echo %YELLOW%[4/6]%NC% Generation du client Prisma...
cd backend
call npx prisma generate
if errorlevel 1 (
    echo %RED%❌ Erreur lors de la generation Prisma%NC%
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓%NC% Prisma client genere

echo.
echo %YELLOW%[5/6]%NC% Reset de la base de donnees...
cd backend
call npx prisma db push --force-reset --accept-data-loss
if errorlevel 1 (
    echo %RED%❌ Erreur lors du reset de la base de donnees%NC%
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓%NC% Base de donnees resetee

echo.
echo %YELLOW%[6/6]%NC% Seed de la base de donnees...
cd backend
call npx prisma db seed
if errorlevel 1 (
    echo %RED%❌ Erreur lors du seed%NC%
    pause
    exit /b 1
)
cd ..
echo %GREEN%✓%NC% Base de donnees seedee

echo.
echo ========================================
echo %GREEN%✅ Installation terminee avec succes!%NC%
echo ========================================
echo.
echo Pour demarrer l'application:
echo   start.bat
echo.
echo Comptes de demo:
echo   admin@aerocheck.com    ^(SUPER_ADMIN^)
echo   qip1@aerocheck.com     ^(QIP^)
echo   dlaa1@aerocheck.com    ^(DLAA^)
echo   agent1@test.com        ^(AGENT^)
echo   Mot de passe: password123
echo.

pause
