@echo off
echo =========================================
echo   PyPath API Client Generator
echo   Generating TypeScript client from Swagger...
echo =========================================
echo.

REM Проверяем наличие Java
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java не установлен!
    echo OpenAPI Generator требует Java. Установите JDK 8 или выше.
    echo Download: https://adoptium.net/
    pause
    exit /b 1
)

echo [OK] Java найден
java -version
echo.

REM Проверяем наличие npx
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm/npx не установлен!
    echo Установите Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Генерация TypeScript клиента...
echo.

REM Создаем директорию для сгенерированного кода
if not exist "src\api\generated\" mkdir src\api\generated

REM Генерируем клиент
call npx @openapitools/openapi-generator-cli generate ^
  -i swagger.json ^
  -g typescript-fetch ^
  -o src/api/generated ^
  --additional-properties=supportsES6=true,typescriptThreePlus=true,withInterfaces=true

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] TypeScript клиент успешно сгенерирован!
    echo.
    echo Файлы созданы в: src\api\generated\
    echo.
    echo Использование в коде:
    echo.
    echo import { DefaultApi, Configuration } from './api/generated';
    echo.
    echo const api = new DefaultApi(new Configuration({
    echo   basePath: 'http://localhost:3000'
    echo }));
    echo.
    echo const user = await api.getCurrentUser();
    echo.
) else (
    echo.
    echo [ERROR] Ошибка генерации клиента
    echo Проверьте swagger.json на ошибки: https://validator.swagger.io/
    pause
    exit /b 1
)

pause
