#!/bin/bash

echo "========================================="
echo "  PyPath API Client Generator"
echo "  Generating TypeScript client from Swagger..."
echo "========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверяем наличие Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Java не установлен!"
    echo "OpenAPI Generator требует Java. Установите JDK 8 или выше."
    echo "Download: https://adoptium.net/"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Java найден: $(java -version 2>&1 | head -n 1)"
echo ""

# Проверяем наличие npx
if ! command -v npx &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm/npx не установлен!"
    echo "Установите Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${YELLOW}[INFO]${NC} Генерация TypeScript клиента..."
echo ""

# Создаем директорию для сгенерированного кода
mkdir -p src/api/generated

# Генерируем клиент
npx @openapitools/openapi-generator-cli generate \
  -i swagger.json \
  -g typescript-fetch \
  -o src/api/generated \
  --additional-properties=supportsES6=true,typescriptThreePlus=true,withInterfaces=true

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[OK]${NC} TypeScript клиент успешно сгенерирован!"
    echo ""
    echo "Файлы созданы в: src/api/generated/"
    echo ""
    echo "Использование в коде:"
    echo ""
    echo "import { DefaultApi, Configuration } from './api/generated';"
    echo ""
    echo "const api = new DefaultApi(new Configuration({"
    echo "  basePath: 'http://localhost:3000'"
    echo "}));"
    echo ""
    echo "const user = await api.getCurrentUser();"
    echo ""
else
    echo ""
    echo -e "${RED}[ERROR]${NC} Ошибка генерации клиента"
    echo "Проверьте swagger.json на ошибки: https://validator.swagger.io/"
    exit 1
fi
