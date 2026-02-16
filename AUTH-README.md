# 🔐 Система авторизации PyPath

## ✅ Что реализовано:

### Backend (FastAPI)
- **JWT токены** для аутентификации
- **Bcrypt хеширование** паролей
- **3 эндпоинта авторизации:**
  - `POST /auth/register` - регистрация нового пользователя
  - `POST /auth/login` - вход в систему
  - `GET /auth/me` - получение данных текущего пользователя

### Frontend (React + TypeScript)
- **AuthPage** - красивая страница входа/регистрации в стиле PyPath
- **Автоматическая проверка** токена при загрузке
- **Защищенные роуты** - без авторизации доступа к приложению нет
- **Кнопка выхода** в настройках (Settings → Security)

## 🚀 Как использовать:

### 1. Откройте приложение
Перейдите на **http://localhost:5174**

### 2. Зарегистрируйтесь
- Выберите "Регистрация"
- Заполните форму:
  - Логин (минимум 3 символа)
  - Email
  - Полное имя
  - Пароль (минимум 6 символов)

### 3. Войдите в систему
После регистрации вы автоматически войдете в систему.

Для последующих входов:
- Выберите "Вход"
- Введите логин и пароль

### 4. Выход из системы
Settings → Security → кнопка "Выйти"

## 🔧 API Endpoints:

### Регистрация
```bash
POST http://127.0.0.1:8000/auth/register
Content-Type: application/json

{
  "username": "myusername",
  "email": "my@email.com",
  "password": "mypass123",
  "fullName": "John Doe"
}

# Ответ:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Вход
```bash
POST http://127.0.0.1:8000/auth/login
Content-Type: application/json

{
  "username": "myusername",
  "password": "mypass123"
}

# Ответ:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Получение текущего пользователя
```bash
GET http://127.0.0.1:8000/auth/me
Authorization: Bearer YOUR_TOKEN_HERE

# Ответ:
{
  "id": "u_1",
  "username": "myusername",
  "email": "my@email.com",
  "fullName": "John Doe",
  "avatar": "https://...",
  "level": "Новичок",
  "xp": 0,
  ...
}
```

## 📝 Swagger UI:
Документация API доступна на:
**http://127.0.0.1:8000/docs**

## 🔑 Безопасность:
- ✅ Пароли хешируются с помощью bcrypt
- ✅ JWT токены с истечением срока (7 дней)
- ✅ Токены хранятся в localStorage
- ✅ Автоматическая проверка токена при каждой загрузке

## 🎨 UI Features:
- Красивая анимированная страница входа
- Переключение между входом/регистрацией
- Показ/скрытие пароля
- Валидация форм
- Показ ошибок
- Плавные переходы

## 📊 Статус:
✅ Backend запущен на http://127.0.0.1:8000
✅ Frontend запущен на http://localhost:5174
✅ Авторизация полностью работает!
