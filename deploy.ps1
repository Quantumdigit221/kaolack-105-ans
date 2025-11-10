# Script de déploiement pour Hostinger
# Kaolack Stories Connect - mairie.quantum221.com

Write-Host "🚀 Déploiement de Kaolack Stories Connect" -ForegroundColor Green
Write-Host "🌐 Domaine: mairie.quantum221.com" -ForegroundColor Cyan

# 1. Construction du frontend avec les variables de production
Write-Host "📦 Construction du frontend pour la production..." -ForegroundColor Yellow
Copy-Item ".env.production" ".env" -Force
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction" -ForegroundColor Red
    exit 1
}

# 2. Création du dossier de déploiement
Write-Host "📂 Création des dossiers de déploiement..." -ForegroundColor Yellow
if (Test-Path "deploy") { Remove-Item "deploy" -Recurse -Force }
New-Item -ItemType Directory -Path "deploy\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "deploy\backend" -Force | Out-Null
New-Item -ItemType Directory -Path "deploy\uploads" -Force | Out-Null

# 3. Copie des fichiers frontend
Write-Host "📋 Copie des fichiers frontend..." -ForegroundColor Yellow
Copy-Item "dist\*" "deploy\frontend\" -Recurse -Force
Copy-Item ".htaccess" "deploy\frontend\" -Force

# 4. Copie des fichiers backend
Write-Host "📋 Copie des fichiers backend..." -ForegroundColor Yellow
$backendFolders = @("config", "middleware", "migrations", "models", "routes")
foreach ($folder in $backendFolders) {
    Copy-Item "backend\$folder" "deploy\backend\" -Recurse -Force
}

# Copie des fichiers de base
Copy-Item "backend\server.production.js" "deploy\backend\server.js" -Force
Copy-Item "backend\package.production.json" "deploy\backend\package.json" -Force
Copy-Item "backend\.env.production" "deploy\backend\.env" -Force

# 5. Création d'un fichier d'instructions
$instructions = @"
🚀 INSTRUCTIONS DE DÉPLOIEMENT HOSTINGER
========================================

🌐 Domaine: mairie.quantum221.com

📂 ÉTAPES D'UPLOAD:

1. FRONTEND (dans public_html/):
   - Uploadez tout le contenu de deploy/frontend/ vers public_html/
   - Assurez-vous que index.html est à la racine
   - Le fichier .htaccess doit être présent

2. BACKEND (dans un sous-dossier, ex: public_html/api/):
   - Créez un dossier 'api' dans public_html/
   - Uploadez tout le contenu de deploy/backend/ vers public_html/api/
   
3. UPLOADS (pour les images):
   - Créez un dossier 'uploads' dans public_html/
   - Donnez les permissions 755 ou 777 au dossier uploads

🔧 CONFIGURATION HOSTINGER:

1. Base de données MySQL:
   - Créez une nouvelle base de données
   - Notez: nom_base, utilisateur, mot_de_passe
   - Mettez à jour le fichier .env avec vos vraies valeurs

2. Variables d'environnement (.env):
   DB_NAME=votre_vraie_base
   DB_USER=votre_vrai_utilisateur  
   DB_PASSWORD=votre_vrai_mot_de_passe
   JWT_SECRET=VotreClefSecreteUltraSecure64Caracteres!

3. Installation via SSH ou Node.js App:
   cd public_html/api
   npm install --production
   npx sequelize-cli db:migrate

4. Configuration Node.js App (si disponible):
   - Application Path: public_html/api
   - Startup File: server.js
   - Node.js Version: 18.x ou plus récent

🔗 URLs finales:
   - Site: https://mairie.quantum221.com
   - API: https://mairie.quantum221.com/api
   - Uploads: https://mairie.quantum221.com/uploads

✅ VÉRIFICATIONS:
   - https://mairie.quantum221.com (page d'accueil)
   - https://mairie.quantum221.com/api/health (test API)
   - Login admin fonctionnel
   - Upload d'images fonctionnel

📞 Support: En cas de problème, vérifiez les logs d'erreur dans le panel Hostinger.
"@

Set-Content -Path "deploy\INSTRUCTIONS_DEPLOIEMENT.txt" -Value $instructions -Encoding UTF8

# 6. Création d'un package ZIP pour faciliter l'upload
Write-Host "📦 Création de l'archive de déploiement..." -ForegroundColor Yellow
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    Compress-Archive -Path "deploy\*" -DestinationPath "kaolack-stories-production.zip" -Force
    Write-Host "✅ Archive créée: kaolack-stories-production.zip" -ForegroundColor Green
}

Write-Host "" -ForegroundColor White
Write-Host "✅ Déploiement préparé avec succès!" -ForegroundColor Green
Write-Host "📁 Fichiers prêts dans le dossier 'deploy/'" -ForegroundColor Cyan
Write-Host "📋 Lisez INSTRUCTIONS_DEPLOIEMENT.txt pour les étapes suivantes" -ForegroundColor Cyan
Write-Host "🌐 Votre site sera disponible sur: https://mairie.quantum221.com" -ForegroundColor Yellow