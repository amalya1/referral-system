#!/bin/bash

# Остановить все контейнеры если они запущены
docker-compose down

# Собрать и запустить контейнеры
docker-compose up --build -d

# Показать запущенные контейнеры
docker-compose ps

echo "Services are running!"
echo "API: http://localhost:3000"
echo "API Documentation: http://localhost:3000/api"
echo "PgAdmin: http://localhost:5050"
echo "PostgreSQL: localhost:5432"
