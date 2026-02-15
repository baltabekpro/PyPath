#!/bin/bash

echo "========================================"
echo "  PyPath API Server"
echo "  Starting mock API and documentation..."
echo "========================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js не установлен!"
    echo "Установите Node.js:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS: brew install node"
    echo "  или скачайте с https://nodejs.org/"
    exit 1
fi

# Проверяем наличие json-server
if ! command -v json-server &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} json-server не найден. Устанавливаем..."
    npm install -g json-server
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Ошибка установки json-server"
        exit 1
    fi
fi

# Проверяем наличие Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Python не установлен!"
    echo "Установите Python 3"
    exit 1
fi

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo -e "${GREEN}[OK]${NC} Все зависимости установлены"
echo ""
echo "Запускаем серверы:"
echo "  - Mock API: http://localhost:3000"
echo "  - Swagger UI: http://localhost:8080/swagger-ui.html"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

# Создаем директорию для логов
mkdir -p logs

# Запускаем JSON Server
json-server --watch db.json --port 3000 > logs/api.log 2>&1 &
API_PID=$!
echo -e "${GREEN}[OK]${NC} Mock API запущен (PID: $API_PID)"

# Ждем 2 секунды для запуска JSON Server
sleep 2

# Запускаем HTTP сервер для Swagger UI
$PYTHON_CMD -m http.server 8080 > logs/swagger.log 2>&1 &
SWAGGER_PID=$!
echo -e "${GREEN}[OK]${NC} Swagger UI сервер запущен (PID: $SWAGGER_PID)"

# Ждем 2 секунды
sleep 2

# Открываем браузер
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080/swagger-ui.html &> /dev/null
elif command -v open &> /dev/null; then
    open http://localhost:8080/swagger-ui.html
fi

echo ""
echo -e "${GREEN}[OK]${NC} Серверы запущены успешно!"
echo ""
echo "Документация доступна по адресу:"
echo "http://localhost:8080/swagger-ui.html"
echo ""
echo "Mock API доступен по адресу:"
echo "http://localhost:3000"
echo ""
echo "Логи сохраняются в директории logs/"
echo ""
echo "Для остановки серверов выполните:"
echo "  kill $API_PID $SWAGGER_PID"
echo ""

# Создаем файл с PID для удобной остановки
echo "$API_PID $SWAGGER_PID" > .server.pid

# Функция для остановки серверов при Ctrl+C
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Останавливаем серверы..."
    kill $API_PID $SWAGGER_PID 2>/dev/null
    rm -f .server.pid
    echo -e "${GREEN}[OK]${NC} Серверы остановлены"
    exit 0
}

trap cleanup INT TERM

# Держим скрипт запущенным
wait
