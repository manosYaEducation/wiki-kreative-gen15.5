@echo off
title Creador de Usuarios - Wiki Kreative (Local)
color 0B

echo.
echo Iniciando el creador de usuarios...
echo.

:: Ruta por defecto de PHP en XAMPP
set PHP_PATH=C:\xampp\php\php.exe

if not exist "%PHP_PATH%" (
    echo [ERROR] No se encontro PHP en %PHP_PATH%
    echo Asegurate de tener XAMPP instalado en C:\xampp y Apache/MySQL iniciados.
    echo.
    pause
    exit /b
)

"%PHP_PATH%" "backend\create_local_user.php"

echo.
pause
