@echo off
echo ===============================================
echo    105 ans de Kaolack - Lancement Reseau Local
echo ===============================================

echo.
echo 🚀 Démarrage du backend...
start "Backend - 105 ans Kaolack" /d "backend" node server.js

timeout /t 3 >nul

echo.
echo 🌐 Démarrage du frontend...
start "Frontend - 105 ans Kaolack" npm run dev

echo.
echo ===============================================
echo    Serveurs démarrés !
echo ===============================================
echo.
echo 📡 Backend API: http://localhost:3001
echo 🖥️  Frontend:   http://localhost:8080
echo.
echo Pour accéder depuis le réseau local:
echo 📱 Trouvez votre IP avec: ipconfig
echo 📱 Puis utilisez: http://[VOTRE-IP]:8080
echo.
echo ===============================================
echo    Installation PWA "105 ans de Kaolack"
echo ===============================================
echo.
echo 1. Ouvrez l'application dans Chrome/Edge
echo 2. Cliquez sur l'icône d'installation dans la barre d'adresse
echo 3. Ou allez dans Menu > Installer "105 ans de Kaolack"
echo.
echo L'icône utilisée sera le logo "105 ans de Kaolack"
echo.
pause