@echo off
echo ========================================
echo   PyPath API Server
echo   Starting mock API and documentation...
echo ========================================
echo.

REM Проверяем наличие Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверяем наличие json-server
where json-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] json-server не найден. Устанавливаем...
    call npm install -g json-server
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Ошибка установки json-server
        pause
        exit /b 1
    )
)

echo [OK] Все зависимости установлены
echo.
echo Запускаем серверы:
echo   - Mock API: http://localhost:3000
echo   - Swagger UI: http://localhost:8080/swagger-ui.html
echo.
echo Для остановки нажмите Ctrl+C
echo.

REM Запускаем JSON Server в фоне
start "PyPath API Server" cmd /k "json-server --watch db.json --port 3000"

REM Ждем 2 секунды для запуска JSON Server
timeout /t 2 /nobreak >nul

REM Запускаем HTTP сервер для Swagger UI
start "Swagger UI Server" cmd /k "cd /d %~dp0 && python -m http.server 8080"

REM Ждем 2 секунды
timeout /t 2 /nobreak >nul

REM Открываем браузер со Swagger UI
start http://localhost:8080/swagger-ui.html

echo.
echo [OK] Серверы запущены успешно!
echo.
echo Документация доступна по адресу:
echo http://localhost:8080/swagger-ui.html
echo.
echo Mock API доступен по адресу:
echo http://localhost:3000
echo.
pause
