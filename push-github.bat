@echo off
echo ================================================
echo    Deployer sur GitHub
echo    105 ans de Kaolack
echo ================================================
echo.
echo Instructions:
echo 1. Allez sur https://github.com/new
echo 2. Creez un repository nomme "kaolack-105-ans"
echo 3. NE cochez PAS "Initialize this repository"
echo 4. Cliquez "Create repository"
echo 5. Revenez ici et appuyez sur Entree
echo.
pause

echo.
echo Entrez votre username GitHub:
set /p USERNAME=

echo.
echo Ajout du remote GitHub...
git remote add origin https://github.com/%USERNAME%/kaolack-105-ans.git

echo.
echo Renommage de la branche...
git branch -M main

echo.
echo Envoi du code vers GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ================================================
    echo    SUCCESS! Code envoye sur GitHub!
    echo ================================================
    echo.
    echo URL de votre repository:
    echo https://github.com/%USERNAME%/kaolack-105-ans
    echo.
    echo Prochaine etape: Deployer sur Railway
    echo https://railway.app
) else (
    echo ================================================
    echo    ERREUR lors du push
    echo ================================================
    echo.
    echo Verifiez:
    echo - Votre username GitHub est correct
    echo - Vous avez acces a ce repository
    echo - Votre token GitHub est configure
)
echo.
pause