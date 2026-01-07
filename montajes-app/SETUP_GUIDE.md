# Guía de Instalación y Automatización - Montajes App

Esta guía detalla cómo poner en marcha la aplicación en un nuevo servidor y configurar las actualizaciones automáticas.

## 1. Requisitos Previos
- **Git**: Instalado y configurado con acceso al repositorio.
- **Docker & Docker Compose**: Instalados y funcionando.
- **PowerShell**: (Viene por defecto en Windows).

## 2. Instalación Inicial
1. Abrir una terminal y clonar el proyecto:
   ```bash
   git clone https://github.com/pausamva/montajes.git
   cd montajes/montajes-app
   ```
2. Levantar la aplicación por primera vez:
   ```bash
   docker-compose up -d --build
   ```
3. La aplicación estará accesible en `http://localhost:3000`.

## 3. Configurar Actualizaciones Automáticas (Windows)
Para que la aplicación se actualice sola todas las noches:

1. Abrir el **Programador de Tareas** de Windows.
2. Clic en **Crear tarea básica...**
3. **Nombre**: `Actualizar Montajes App`.
4. **Desencadenador**: Diariamente (ej: 03:00 AM).
5. **Acción**: Iniciar un programa.
6. **Programa/script**: `powershell.exe`
7. **Argumentos**: 
   ```powershell
   -ExecutionPolicy Bypass -File "C:\Ruta\A\Tu\Proyecto\update-app.ps1"
   ```
   *(Asegúrate de poner la ruta real donde hayas clonado el proyecto en el servidor).*

## 4. Notas de Mantenimiento
- El script de actualización (`update-app.ps1`) descarga los cambios de la rama `master` y reconstruye el contenedor únicamente si hay cambios.
- Si cambias la ubicación de la carpeta del proyecto, recuerda actualizar la ruta dentro del archivo `update-app.ps1` (línea 5).
