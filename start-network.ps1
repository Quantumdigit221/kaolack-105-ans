# Script de lancement pour réseau local - 105 ans de Kaolack
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    105 ans de Kaolack - Lancement Reseau Local" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Obtenir l'adresse IP locale
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -ne "169.254.*"} | Select-Object -First 1).IPAddress
}

Write-Host "🌐 Adresse IP détectée: $ip" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Démarrage du backend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd 'backend'; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "🌐 Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command", "npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Serveurs démarrés !" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Backend API:" -ForegroundColor White
Write-Host "   Local:  http://localhost:3001" -ForegroundColor Gray
Write-Host "   Réseau: http://${ip}:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "🖥️  Frontend PWA:" -ForegroundColor White
Write-Host "   Local:  http://localhost:8080" -ForegroundColor Gray
Write-Host "   Réseau: http://${ip}:8080" -ForegroundColor Green
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Installation PWA '105 ans de Kaolack'" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Pour installer depuis un appareil mobile:" -ForegroundColor White
Write-Host "   1. Connectez-vous au même réseau Wi-Fi"
Write-Host "   2. Ouvrez: http://${ip}:8080" -ForegroundColor Green
Write-Host "   3. Dans Chrome/Safari: Menu > Ajouter à l'écran d'accueil"
Write-Host "   4. L'icône sera le logo '105 ans de Kaolack' 🎉"
Write-Host ""
Write-Host "🖥️  Pour installer depuis un PC:" -ForegroundColor White
Write-Host "   1. Ouvrez Chrome/Edge"
Write-Host "   2. Cliquez sur l'icône d'installation dans la barre d'adresse"
Write-Host "   3. Ou Menu > Installer '105 ans de Kaolack'"
Write-Host ""

Read-Host "Appuyez sur Entrée pour continuer..."