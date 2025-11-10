# Script d'export de la base de données pour déploiement
# Exécuter depuis le dossier du projet

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Export Base de Données - 105 ans de Kaolack" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$dbName = "mairiekl_1762258379671"
$exportFile = "kaolack_105_export.sql"

Write-Host "📊 Export de la base de données: $dbName" -ForegroundColor Green
Write-Host "📄 Fichier de sortie: $exportFile" -ForegroundColor Green
Write-Host ""

try {
    # Export avec structure et données
    $exportCmd = "c:\xampp\mysql\bin\mysqldump.exe -u root -h localhost --routines --triggers --single-transaction $dbName"
    
    Write-Host "🔄 Export en cours..." -ForegroundColor Yellow
    Invoke-Expression "$exportCmd > $exportFile"
    
    if (Test-Path $exportFile) {
        $fileSize = (Get-Item $exportFile).Length / 1KB
        Write-Host "✅ Export réussi !" -ForegroundColor Green
        Write-Host "📁 Fichier: $exportFile ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
        Write-Host "1. Créer compte Railway: https://railway.app" -ForegroundColor White
        Write-Host "2. Créer projet avec MySQL database" -ForegroundColor White
        Write-Host "3. Importer ce fichier dans Railway MySQL" -ForegroundColor White
        Write-Host "4. Configurer variables d'environnement" -ForegroundColor White
        Write-Host ""
        
        # Afficher les premières lignes pour vérification
        Write-Host "🔍 Aperçu du fichier exporté:" -ForegroundColor Cyan
        Get-Content $exportFile -Head 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        Write-Host "  ..." -ForegroundColor Gray
        
    } else {
        Write-Host "❌ Erreur lors de l'export" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Read-Host "Appuyez sur Entree pour continuer"