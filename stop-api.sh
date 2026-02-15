#!/bin/bash

echo "Останавливаем PyPath API серверы..."

# Читаем PID из файла если он существует
if [ -f .server.pid ]; then
    PIDS=$(cat .server.pid)
    kill $PIDS 2>/dev/null
    rm -f .server.pid
    echo "✓ Серверы остановлены"
else
    # Пытаемся найти и остановить процессы по портам
    echo "Ищем процессы на портах 3000 и 8080..."
    
    # Для json-server (порт 3000)
    PID_3000=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$PID_3000" ]; then
        kill $PID_3000 2>/dev/null
        echo "✓ Процесс на порту 3000 остановлен"
    fi
    
    # Для http.server (порт 8080)
    PID_8080=$(lsof -ti:8080 2>/dev/null)
    if [ ! -z "$PID_8080" ]; then
        kill $PID_8080 2>/dev/null
        echo "✓ Процесс на порту 8080 остановлен"
    fi
    
    if [ -z "$PID_3000" ] && [ -z "$PID_8080" ]; then
        echo "Запущенные серверы не найдены"
    fi
fi
