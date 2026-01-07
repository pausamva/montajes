# Script de actualización automática para Montajes App
Write-Host "Iniciando actualización desde GitHub..." -ForegroundColor Cyan

# Navegar a la carpeta del proyecto
Set-Location "c:\Users\pausa\OneDrive\Documentos\antigravity\Montajes\montajes-app"

# Bajar cambios de GitHub
git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Cambios descargados con éxito. Reconstruyendo contenedores..." -ForegroundColor Green
    # Levantar Docker con build
    docker-compose up -d --build
    Write-Host "¡Actualización completada!" -ForegroundColor Green
} else {
    Write-Host "Error al descargar cambios de GitHub. Revisa tu conexión o credenciales." -ForegroundColor Red
}

Write-Host "Presiona cualquier tecla para salir..."
# $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
