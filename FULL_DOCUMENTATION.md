# 📚 PyPath — Полная Документация Проекта

## Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Технологический стек](#технологический-стек)
3. [Архитектура приложения](#архитектура-приложения)
4. [Структура проекта](#структура-проекта)
5. [Frontend](#frontend)
6. [Backend](#backend)
7. [Аутентификация и безопасность](#аутентификация-и-безопасность)
8. [База данных](#база-данных)
9. [AI интеграция (Google Gemini)](#ai-интеграция-google-gemini)
10. [API эндпоинты](#api-эндпоинты)
11. [Деплой и инфраструктура](#деплой-и-инфраструктура)
12. [Разработка и тестирование](#разработка-и-тестирование)
13. [Конфигурация](#конфигурация)
14. [Best Practices](#best-practices)
15. [Часто задаваемые вопросы](#часто-задаваемые-вопросы)

---

## Обзор проекта

### Описание

**PyPath** — это образовательная платформа для изучения Python с геймификацией, миссиями, рейтингами, встроенным редактором кода и AI-ассистентом на основе Google Gemini.

### Основные возможности

- 🎮 **Геймификация**: Система уровней, XP, достижений, лидерборда и лиг
- 📚 **Курсы и миссии**: Структурированное обучение с практическими заданиями
- 💻 **Встроенный редактор**: Monaco Editor с поддержкой Python и синтаксиса
- 🤖 **AI-ассистент**: Google Gemini для помощи в обучении ("Оракул Кода")
- 👥 **Социальное сообщество**: Посты, друзья, общий чат, лидерборд
- 🏆 **Система достижений**: Различные категории наград (кодирование, сообщество, серии)
- 🌙 **Темная и светлая тема**: Поддержка обеих режимов с Tailwind CSS
- 📱 **Кросс-платформенность**: Работает на мобильных устройствах и десктопах

### Целевая аудитория

- Студенты, изучающие Python
- Учебные заведения и онлайн-школы
- Разработчики, желающие практиковать Python в игровой форме

---

## Технологический стек

### Frontend

| Компонент | Технология | Версия | Назначение |
|-----------|-----------|--------|-----------|
| Framework | React | 18.2.0 | UI библиотека для SPA |
| Language | TypeScript | 5.2.2 | Типизация JavaScript |
| Build Tool | Vite | 5.1.5 | Быстрая сборка и dev server |
| Styling | Tailwind CSS | - | Утилитарные CSS классы |
| Code Editor | Monaco Editor | 4.6.0 | Полнофункциональный редактор кода |
| Terminal | xterm.js | 5.3.0 | Эмуляция терминала в браузере |
| Charts | Recharts | 2.12.2 | Графики и диаграммы |
| Icons | lucide-react | 0.344.0 | SVG иконки |

### Backend

| Компонент | Технология | Версия | Назначение |
|-----------|-----------|--------|-----------|
| Framework | FastAPI | 0.116.1 | Асинхронный веб-фреймворк |
| Server | Uvicorn | 0.35.0 | ASGI сервер |
| ORM | SQLAlchemy | 2.0.36 | Работа с БД |
| Migrations | Alembic | 1.14.0 | Миграции БД |
| Валидация | Pydantic | 2.11.7 | Валидация данных |
| JWT | python-jose | 3.3.0 | Создание JWT токенов |
| Password | passlib + bcrypt | 1.7.4 | Хеширование паролей |
| AI | google-generativeai | 0.8.3 | Интеграция Google Gemini |
| Testing | pytest | 8.4.1 | Фреймворк для тестов |
| Database | SQLite/PostgreSQL | - | Хранение данных |

### Инфраструктура

| Компонент | Технология | Версия | Назначение |
|-----------|-----------|--------|-----------|
| Containerization | Docker | Latest | Контейнеризация приложения |
| Orchestration | Docker Compose | - | Управление сервисами |
| Frontend Deploy | Vercel | - | Хостинг React SPA |
| Backend Deploy | Docker | - | Хостинг FastAPI приложения |
| Proxy | Vercel Rewrites | - | Проксирование `/api-proxy/*` на backend |

---

## Архитектура приложения

### Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  React 18 SPA (TypeScript)                              │ │
│  │  - Vite development server (localhost:5173)             │ │
│  │  - Tailwind CSS styling                                 │ │
│  │  - Monaco Editor, xterm.js, Recharts                    │ │
│  │  - JWT token management                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────┬──────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │ Dev: localhost:8000     │
        │ Prod: /api-proxy        │
        │ (Vercel Rewrite)        │
        │
┌───────▼────────────────────────────────────────────────────────┐
│                  Backend (Docker Container)                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FastAPI + Uvicorn (Python)                              │ │
│  │  Port 8000                                                │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  API Routes (Routers)                                │ │ │
│  │  │  - auth_routes.py (JWT, register, login)            │ │ │
│  │  │  - routes.py (User, Courses, Missions, etc.)        │ │ │
│  │  │  - ai_routes.py (Google Gemini Chat)                │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         ▲                                  │ │
│  │                         │                                  │ │
│  │  ┌──────────────────────┴──────────────────────────────┐ │ │
│  │  │  Service Layer (Business Logic)                    │ │ │
│  │  │  - DatabaseService (CRUD operations)               │ │ │
│  │  │  - AIService (Gemini integration)                  │ │ │
│  │  │  - Authentication utils                            │ │ │
│  │  └──────────────────────┬──────────────────────────────┘ │ │
│  │                         │                                  │ │
│  │  ┌──────────────────────▼──────────────────────────────┐ │ │
│  │  │  Data Layer (SQLAlchemy ORM)                       │ │ │
│  │  │  - Models (User, Post, Course, Mission, etc.)     │ │ │
│  │  │  - Pydantic Schemas (validation & serialization) │ │ │
│  │  └──────────────────────┬──────────────────────────────┘ │ │
│  └─────────────────────────┼──────────────────────────────────┘ │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
        ┌─────▼──────────┐        ┌────────▼────────┐
        │   PostgreSQL   │        │  Google Gemini  │
        │   /SQLite      │        │   API           │
        │                │        │                 │
        │ Persistence    │        │ AI Chat         │
        └────────────────┘        └─────────────────┘
```

### Поток данных

#### Frontend → Backend

```
User Action (e.g., Submit Code)
         ↓
React Component State Update
         ↓
API Call (api.ts) - apiPost, apiGet, etc.
         ↓
JWT Token in Authorization Header
         ↓
Server: localhost:8000 or /api-proxy
         ↓
FastAPI Route Handler
         ↓
Service Layer (DatabaseService/AIService)
         ↓
SQLAlchemy Query or External API Call
         ↓
Response (JSON)
         ↓
Frontend State Update
         ↓
Component Re-render
```

#### Backend Architecture (Deep Dive)

```
app/
├── api/
│   ├── routes.py              # Main API endpoints
│   ├── auth_routes.py         # Authentication endpoints
│   ├── ai_routes.py           # AI chat endpoints
│   └── dependencies.py        # Dependency injection (JWT, DB)
├── core/
│   ├── config.py              # Settings (environment variables)
│   ├── database.py            # SQLAlchemy setup
│   ├── auth.py                # JWT, password hashing
│   ├── bootstrap.py           # Initialize admin, courses, missions
│   ├── errors.py              # Exception handlers
│   ├── logging_middleware.py  # Request logging
│   └── rate_limit.py          # Rate limiting logic
├── models/
│   └── models.py              # SQLAlchemy ORM models
├── schemas/
│   ├── auth.py                # Authentication schemas
│   ├── ai_schemas.py          # AI request/response schemas
│   ├── requests.py            # General request DTOs
│   └── __init__.py
├── services/
│   ├── database_service.py    # Business logic + CRUD
│   ├── ai_service.py          # Google Gemini integration
│   └── __init__.py
└── main.py                     # FastAPI app creation
```

### React Компонентная архитектура

```
App.tsx (Root Component - State Management)
├── Header.tsx
│   ├── User avatar & level
│   ├── Search bar
│   ├── Notifications Bell
│   └── Theme toggle
├── Sidebar.tsx
│   ├── Navigation menu
│   ├── User profile quick view
│   └── Logo
├── Main View (based on currentView state)
│   ├── Dashboard.tsx
│   │   ├── User stats overview
│   │   ├── Quick mission chips
│   │   └── Progress chart
│   ├── Courses.tsx
│   │   ├── Course list
│   │   └── Progress indicators
│   ├── CourseJourney.tsx
│   │   ├── Editor.tsx (Monaco Editor)
│   │   │   ├── Code editor pane
│   │   │   ├── Terminal (xterm.js)
│   │   │   ├── Mission details
│   │   │   └── Knowledge base
│   │   └── Run/Submit buttons
│   ├── SimpleLearning.tsx
│   │   └── Simplified learning UI
│   ├── AIChatPage.tsx
│   │   ├── Chat history
│   │   ├── Message input
│   │   └── AI responses
│   ├── Profile.tsx
│   │   ├── User info
│   │   ├── Statistics
│   │   └── Activity feed
│   ├── Leaderboard.tsx
│   │   ├── Global rankings
│   │   ├── Filter controls
│   │   └── Rank badges
│   ├── Achievements.tsx
│   │   ├── Achievement cards
│   │   ├── Category filters
│   │   └── Progress bars
│   ├── Settings.tsx
│   │   ├── Theme selector
│   │   ├── Notification settings
│   │   └── Account settings
│   ├── AuthPage.tsx
│   │   ├── Login form
│   │   └── Register form
│   └── AdminPanel.tsx (Lazy loaded)
│       ├── User management
│       ├── Course editor
│       └── System statistics
└── ActionToast.tsx (Global notifications)
```

---

## Структура проекта

### Root Directory

```
PyPath/
├── README.md                      # Основная документация
├── API-README.md                  # API документация
├── FULL_DOCUMENTATION.md          # Эта документация
├── QUICKSTART.md                  # Быстрый старт
├── package.json                   # npm dependencies (frontend)
├── tsconfig.json                  # TypeScript конфигурация
├── vite.config.ts                 # Vite конфигурация
├── vercel.json                    # Vercel deployment config
├── index.html                     # HTML entry point
├── index.tsx                      # React entry point
├── App.tsx                        # Root React component
├── types.ts                       # TypeScript типы
├── constants.tsx                  # Константы приложения
├── api.ts                         # API клиент
├── styles.css                     # Глобальные стили
│
├── components/                    # React компоненты
│   ├── Achievements.tsx
│   ├── AdminPanel.tsx            # Lazy loaded
│   ├── AIChat.tsx
│   ├── AIChatPage.tsx
│   ├── AuthPage.tsx
│   ├── Community.tsx             # Posts, friends, chat
│   ├── CourseJourney.tsx         # Learning interface
│   ├── Courses.tsx               # Course list
│   ├── Dashboard.tsx             # Home page
│   ├── Editor.tsx                # Monaco editor + xterm
│   ├── Header.tsx
│   ├── Leaderboard.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Sidebar.tsx
│   └── SimpleLearning.tsx        # Simplified UI
│
├── hooks/                         # Custom React hooks
│   └── useCourseJourneyData.ts   # State management for learning
│
├── backend/                       # Python FastAPI backend
│   ├── main.py                    # ASGI entry point
│   ├── requirements.txt           # pip dependencies
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── pytest.ini
│   ├── README.md
│   ├── .env.example               # Environment template
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app creation
│   │   │
│   │   ├── api/
│   │   │   ├── routes.py          # Main API routes
│   │   │   ├── auth_routes.py     # JWT auth
│   │   │   ├── ai_routes.py       # Gemini chat
│   │   │   ├── dependencies.py    # Dependency injection
│   │   │   └── __init__.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py          # Settings + pydantic
│   │   │   ├── database.py        # SQLAlchemy setup
│   │   │   ├── auth.py            # JWT + hashing
│   │   │   ├── bootstrap.py       # Data initialization
│   │   │   ├── errors.py          # Exception handlers
│   │   │   ├── logging_middleware.py
│   │   │   ├── rate_limit.py      # Rate limiting
│   │   │   └── __init__.py
│   │   │
│   │   ├── models/
│   │   │   ├── models.py          # ORM models
│   │   │   └── __init__.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py            # Login, Register schemas
│   │   │   ├── ai_schemas.py      # Chat request/response
│   │   │   ├── requests.py        # CRUD schemas
│   │   │   └── __init__.py
│   │   │
│   │   └── services/
│   │       ├── database_service.py # Business logic
│   │       ├── ai_service.py       # Gemini integration
│   │       └── __init__.py
│   │
│   ├── tests/
│   │   ├── test_api.py
│   │   └── __pycache__/
│   │
│   ├── alembic/                   # Database migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   └── data/                      # Static data (seeds)
│
└── vercel-deploy/                 # Built frontend (production)
    ├── index.html
    └── assets/
```

### Зависимости проекта

#### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@monaco-editor/react": "^4.6.0",
    "xterm": "^5.3.0",
    "xterm-addon-fit": "^0.8.0",
    "recharts": "^2.12.2",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "vite": "^5.1.5",
    "@vitejs/plugin-react": "^4.2.1"
  }
}
```

#### Backend (requirements.txt)

```
fastapi==0.116.1              # Web framework
uvicorn==0.35.0               # ASGI server
pydantic==2.11.7              # Data validation
pydantic-settings==2.10.1     # Config management
sqlalchemy==2.0.36            # ORM
alembic==1.14.0               # Database migrations
psycopg2-binary==2.9.10       # PostgreSQL adapter
python-jose==3.3.0            # JWT tokens
passlib==1.7.4                # Password hashing
bcrypt                        # Encryption
google-generativeai==0.8.3    # Gemini API
pytest==8.4.1                 # Testing
httpx==0.28.1                 # HTTP client
email-validator==2.2.0        # Email validation
python-multipart==0.0.9       # Form parsing
```

---

## Frontend

### Обзор Frontend

Frontend — это Single Page Application (SPA) на React 18, TypeScript и Vite. Все компоненты функциональные с использованием hooks для управления состоянием. Стилизация выполнена с помощью Tailwind CSS с поддержкой темной и светлой тем.

### App.tsx (Root Component)

Главный компонент приложения управляет:

```typescript
// State Management
- isAuthenticated: boolean              // Статус авторизации
- currentUser: User                     // Данные текущего пользователя
- currentView: View                     // Текущая страница
- theme: 'light' | 'dark'              // Тема проекта
- language: AppLanguage                 // Язык (ru/kz)
- isMobileMenuOpen: boolean            // Мобильное меню
- appNotifications: NotificationItem[]  // Уведомления
- toastMessage: string                  // Всплывающие сообщения
```

**Ключевые функции:**

1. **Инициализация приложения** (`useEffect`):
   - Проверка токена в localStorage
   - Загрузка данных пользователя
   - Инициализация уведомлений

2. **Управление аутентификацией**:
   - `handleAuthSuccess`: Сохранение токена и данных
   - `handleLogout`: Удаление токена и очистка состояния

3. **Управление темой**:
   - Сохранение в localStorage
   - Синхронизация с `document.documentElement.classList`

4. **Управление языком**:
   - Переключение между русским и казахским
   - Обновление всех текстов через `constants.tsx`

5. **Рендеринг представлений**:
   - Каждому View соответствует компонент
   - AdminPanel загружается лениво (`lazy()` + `Suspense`)

### API Client (api.ts)

Модуль `api.ts` инкапсулирует все API запросы:

```typescript
// Базовая конфигурация
const API_BASE_URL = isVercelHost ? '/api-proxy' : 'http://localhost:8000'

// Основные методы
apiGet<T>(path: string)                    // GET запрос
apiPost<T>(path: string, body?: any)       // POST запрос
apiPut<T>(path: string, body?: any)        // PUT запрос
apiDelete<T>(path: string)                 // DELETE запрос

// Функциональные группы (namespaces)
aiChat.sendMessage(message, userId, chatId)
aiChat.quickAction(actionType, userId, chatId)
aiChat.getHistory(userId, chatId)
notificationsApi.getAll()
```

**Механизм авторизации:**

```typescript
const token = localStorage.getItem('token')
if (token) {
  headers['Authorization'] = `Bearer ${token}`
}
```

**Обработка ошибок:**

```typescript
if (!response.ok) {
  // Парсинг JSON ошибки
  const parsed = JSON.parse(raw)
  const detail = parsed?.detail || parsed?.message
  throw new Error(detail)
}
```

### View Enum

```typescript
enum View {
  DASHBOARD              // Главная страница с обзором
  COURSES                // Каталог курсов
  COURSE_JOURNEY         // Режим обучения (редактор + задачи)
  SIMPLE_LEARNING        // Упрощённый интерфейс обучения
  AI_CHAT                // Полноэкранный AI чат
  PROFILE                // Профиль пользователя
  LEADERBOARD            // Таблица лидеров
  ACHIEVEMENTS           // Достижения
  SETTINGS               // Настройки
  ADMIN                  // Панель администратора (ленивая загрузка)
}
```

### Типы данных (types.ts)

#### User Interface

```typescript
interface User {
  id?: string
  username?: string
  role?: string
  name: string                       // Отображаемое имя
  email?: string
  fullName?: string
  level: string                      // "Новичок", "Эксперт", etc.
  levelNum: number                   // 1, 2, 3...
  xp: number                         // Опыт
  maxXp?: number                     // XP до следующего уровня
  streak: number                     // Количество дней подряд
  rank: number                       // Позиция в лидерборде
  avatar: string                     // URL аватара
  bio?: string
  league?: string                    // "Bronze", "Silver", "Gold"
  settings?: {
    theme: string
    notifications: boolean
    sound: boolean
    role?: string                    // "admin" если администратор
    is_admin?: boolean
  }
}
```

#### Course Interface

```typescript
interface Course {
  id: number
  title: string                      // Название курса
  description: string
  progress: number                   // 0-100 процентов
  totalLessons: number              // Всего уроков в курсе
  icon: string                      // Иконка (lucide-react name)
  color: string                     // HEX цвет
  difficulty: string                // "easy", "medium", "hard"
  stars: number                     // Рейтинг курса
  isBoss: boolean                   // Финальный курс сезона
  locked: boolean                   // Завершён ли курс
  season?: number                   // Номер сезона
  status?: 'locked' | 'in_progress' | 'completed'
  seasonCompleted?: boolean
}
```

#### Другие интерфейсы

```typescript
interface Mission {
  id: string
  title: string
  chapter: string
  description: string
  difficulty: string
  xpReward: number
  objectives: string[]
  starterCode: string
  testCases: Array<{ input: string; output: string }>
  hints: string[]
}

interface Achievement {
  id: number
  title: string
  description: string
  icon: string
  rarity: string                  // "common", "rare", "epic"
  category: string                // "coding", "community", "streak"
  progress: number
  total: number
  unlocked: boolean
}
```

### Компоненты Frontend

#### Dashboard.tsx

Главная страница с обзором прогресса:

```typescript
// Функциональность
- Отображение статистики пользователя (XP, уровень, серия)
- Текущий прогресс по курсам
- Рекомендованные миссии
- Быстрые ссылки на другие разделы
- Мотивирующие сообщения

// Props
interface DashboardProps {
  setView: (view: View) => void
}
```

#### CourseJourney.tsx + Editor.tsx

Основной интерфейс обучения:

**Editor.tsx содержит:**

1. **Monaco Editor** — редактор кода Python
   ```typescript
   <MonacoEditor
     defaultLanguage="python"
     defaultValue={starterCode}
     onChange={handleCodeChange}
     theme={theme === 'dark' ? 'vs-dark' : 'vs'}
   />
   ```

2. **xterm.js** — эмулятор терминала
   ```typescript
   // Выполнение кода и вывод результата
   // Отображение ошибок
   ```

3. **Mission Panel** — описание задачи
   - Цели задачи
   - Ожидаемый вывод
   - Частые ошибки
   - Подсказки

4. **Knowledge Base** — теоретический материал
   -概념 объяснения
   - Примеры кода
   - Ссылки на документацию

#### AIChatPage.tsx / AIChat.tsx

AI-ассистент на основе Google Gemini:

```typescript
// Функциональность
- История чата
- Ввод сообщений
- AI ответы в реальном времени
- Быстрые действия (hint, error, theory, motivation)
- Сохранение истории

// Props
interface AIChatProps {
  userId: string
  chatId?: string
  onClose?: () => void
}
```

#### Leaderboard.tsx

Таблица лидеров:

```typescript
// Фильтры
scope: 'global' | 'friends' | 'school'
period: 'all' | 'week' | 'month'

// Отображение
- Рейтинг пользователя
- XP и уровень
- Значки и медали
- Школа (если доступно)
```

#### Achievements.tsx

Система достижений:

```typescript
// Категории
- Coding: Достижения по программированию
- Community: Социальные достижения
- Streak: Серии активности
- Secret: Скрытые достижения

// Отображение
- Карточки достижений
- Прогресс-бар
- Статус (заблокировано/разблокировано)
- Редкость (common/rare/epic/legendary)
```

#### Profile.tsx

Профиль пользователя:

```typescript
// Информация
- Аватар и имя
- Уровень, XP
- Статистика (проекты, посты)
- Активность по дням
- Время на платформе
- Список друзей

// Действия
- Редактирование профиля
- Добавление в друзья
- Просмотр сообщений
```

#### Settings.tsx

Настройки приложения:

```typescript
// Опции
- Выбор темы (light/dark)
- Язык (русский/казахский)
- Уведомления
- Звук
- Безопасность (смена пароля)
- О приложении
```

#### AdminPanel.tsx (Lazy Loaded)

Панель управления (только для администраторов):

```typescript
// Функции
- Управление пользователями
- Создание и редактирование курсов
- Управление миссиями
- Статистика системы
- Логи активности
```

### Styling и Tailwind

#### Темы

```css
/* Light Mode (default) */
background: white
text-color: black
border: gray-200

/* Dark Mode (с префиксом dark:) */
dark:background: #1a1a1a
dark:text: white
dark:border: gray-800
```

#### Примеры использования

```jsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border border-gray-200 dark:border-gray-800
  rounded-lg shadow-md dark:shadow-lg
  p-4 transition-colors
">
```

#### Mobile Responsiveness

```jsx
// Скрыто на мобильных
className="hidden md:block"

// Видно только на мобильных
className="md:hidden"

// Адаптивные размеры
className="w-full md:w-1/2 lg:w-1/3"

// Адаптивная сетка
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Управление состоянием

**Props Drilling vs Local State:**

```typescript
// Props drilling (для простых данных)
<Dashboard setView={setCurrentView} />

// Local state (для локальных компонентов)
const [expanded, setExpanded] = useState(false)

// Context не используется (проект рекомендует props drilling)
```

### React Hooks

#### useState

```typescript
const [code, setCode] = useState(starterCode)
const [output, setOutput] = useState('')
const [isRunning, setIsRunning] = useState(false)
```

#### useEffect

```typescript
// Загрузка данных при монтировании компонента
useEffect(() => {
  loadMissions()
}, [])

// Синхронизация с localStorage
useEffect(() => {
  localStorage.setItem('theme', theme)
}, [theme])

// Cleanup функции
useEffect(() => {
  const unsubscribe = subscribeToUpdates()
  return () => unsubscribe()
}, [])
```

#### useCallback

```typescript
const handleSubmit = useCallback(async (code: string) => {
  const result = await apiPost('/missions/submit', { code })
  setXp(result.xp)
}, [])
```

#### Пользовательские хуки

```typescript
// hooks/useCourseJourneyData.ts
function useCourseJourneyData(courseId: number) {
  const [course, setCourse] = useState<Course | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const c = await apiGet(`/courses/${courseId}`)
      const m = await apiGet(`/courses/${courseId}/missions`)
      setCourse(c)
      setMissions(m)
      setLoading(false)
    }
    load()
  }, [courseId])

  return { course, missions, loading }
}
```

---

## Backend

### Обзор Backend

Backend — это REST API на FastAPI (асинхронный), использующий SQLAlchemy для работы с БД и Pydantic для валидации. Архитектура следует многослойному шаблону: API Routes → Services → Database Layer.

### FastAPI приложение (main.py)

```python
def create_app() -> FastAPI:
    settings = get_settings()
    
    app = FastAPI(
        title="PyPath Backend API",
        version="1.1.0",
        description="...",
        openapi_tags=[
            {"name": "Health", "description": "..."},
            {"name": "Authentication", "description": "..."},
            {"name": "User", "description": "..."},
            # ... другие теги
        ]
    )
    
    # Middleware
    app.add_middleware(CORSMiddleware, ...)
    app.add_middleware(RequestLoggingMiddleware)
    
    # Exception handlers
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
    
    # Роуты
    app.include_router(router)           # Основные роуты
    app.include_router(auth_router)      # Аутентификация
    app.include_router(ai_router)        # AI chat
    
    # Bootstrap (при запуске)
    @app.on_event("startup")
    async def startup():
        ensure_admin_account()
        ensure_default_courses()
        ensure_default_missions()
    
    return app

app = create_app()
```

### ORM Модели (models.py)

#### User Model

```python
class User(Base):
    __tablename__ = "users"

    id: str (primary_key, index)         # UUID
    username: str (unique)               # Уникальное имя
    email: str (unique)                  # Email для реквизиции
    password: str                        # Хэшированный пароль
    full_name: str                       # Полное имя
    name: str                            # Отображаемое имя
    avatar: str                          # URL аватара
    bio: str (optional)                  # Биография
    
    # Геймификация
    level: str = "Новичок"              # Уровень
    level_num: int = 1                  # Числовой уровень
    xp: int = 0                         # Опыт
    max_xp: int = 100                   # XP до следующего
    streak: int = 0                     # Серия дней
    rank: int = 0                       # Позиция в лидерборде
    league: str = "Bronze"              # Лига (Bronze/Silver/Gold)
    
    # Настройки
    settings: JSON = {
        "theme": "dark",
        "notifications": True,
        "sound": True,
        "role": "user",                 # или "admin"
        "is_admin": False
    }
    
    created_at: datetime
    updated_at: datetime
```

#### Course Model

```python
class Course(Base):
    __tablename__ = "courses"

    id: int (primary_key)
    title: str                           # Название
    description: str (Text)              # Полное описание
    progress: int = 0                    # % прохождения
    total_lessons: int = 0               # Количество уроков
    icon: str                            # lucide-react иконка
    color: str                           # HEX цвет
    difficulty: str                      # "easy", "medium", "hard"
    stars: int = 0                       # Рейтинг (0-5)
    is_boss: bool = False                # Финальный курс сезона
    locked: bool = False                 # Заблокирован ли
```

#### Mission Model

```python
class Mission(Base):
    __tablename__ = "missions"

    id: str (primary_key)                # UUID
    title: str                           # Название задачи
    chapter: str                         # Раздел
    description: str (Text)              # Полное описание
    difficulty: str                      # Уровень сложности
    xp_reward: int = 0                   # XP за выполнение
    
    objectives: JSON = [                 # Цели задачи
        "Создать функцию",
        "Использовать цикл"
    ]
    
    starter_code: str (Text)             # Начальный код
    
    test_cases: JSON = [                 # Тестовые случаи
        {"input": "5", "output": "120"},
        {"input": "0", "output": "1"}
    ]
    
    hints: JSON = [                      # Подсказки
        "Используйте рекурсию",
        "Проверьте граничный случай"
    ]
```

#### Additional Models

```python
# Post - для ленты сообщества
class Post(Base):
    __tablename__ = "posts"
    id: int
    author_name: str
    content: str
    tags: JSON
    likes: int
    created_at: datetime

# Achievement - система наград
class Achievement(Base):
    __tablename__ = "achievements"
    id: int
    title: str
    description: str
    category: str                        # "coding", "community", "streak", "secret"
    rarity: str                          # "common", "rare", "epic"
    progress: int
    total: int
    unlocked: bool

# LeaderboardEntry - для таблицы лидеров
class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"
    id: int
    rank: int
    name: str
    xp: int
    level: int
    scope: str                           # "global", "friends", "school"
```

### Pydantic Схемы (schemas/)

#### Аутентификация (auth.py)

```python
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr                      # Валидация email
    password: str = Field(..., min_length=8)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict                           # Данные пользователя
```

#### Запросы CRUD (requests.py)

```python
class UserUpdate(BaseModel):
    name: str | None = None
    bio: str | None = None
    avatar: str | None = None
    settings: dict | None = None

class MissionSubmit(BaseModel):
    mission_id: str
    code: str = Field(..., max_length=10000)
    user_id: str | None = None

class PostCreate(BaseModel):
    content: str = Field(..., max_length=500)
    tags: list[str] = []
    code: str | None = None

class CourseCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    icon: str
    color: str

class MissionCreate(BaseModel):
    title: str
    chapter: str
    description: str
    difficulty: str
    xp_reward: int
    objectives: list[str]
    starter_code: str
    test_cases: list[dict]
    hints: list[str]
```

#### AI Схемы (ai_schemas.py)

```python
class ChatMessageRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    user_id: str | None = None
    chat_id: str | None = None

class ChatResponse(BaseModel):
    response: str                        # AI ответ
    timestamp: str                       # ISO 8601

class QuickActionRequest(BaseModel):
    action_type: Literal['hint', 'error', 'theory', 'motivation']
    user_id: str | None = None
    chat_id: str | None = None

class AIHistoryItem(BaseModel):
    id: str
    sender: Literal['user', 'ai']
    text: str
    timestamp: str

class AIHistoryResponse(BaseModel):
    items: list[AIHistoryItem]
    active_chat_id: str | None = None
    chats: list[dict] | None = None
```

### API Роуты (api/routes.py)

#### Health Check

```python
@router.get("/", tags=["Health"])
def root() -> dict:
    return {"name": "PyPath Backend API", "docs": "/docs"}

@router.get("/health", tags=["Health"])
def health() -> dict:
    return {"status": "ok"}

@router.get("/health/ready", tags=["Health"])
def ready(service: DatabaseService = Depends(get_db_service)) -> dict:
    service.db.execute("SELECT 1")
    return {"status": "ready"}
```

#### User Endpoints

```python
@router.get("/currentUser", tags=["User"])
def get_current_user(
    user: User = Depends(get_current_user)
) -> dict:
    """Получить профиль текущего пользователя"""
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "level": user.level,
        "levelNum": user.level_num,
        "xp": user.xp,
        "maxXp": user.max_xp,
        "streak": user.streak,
        "rank": user.rank,
        "league": user.league,
        "settings": user.settings
    }

@router.put("/currentUser", tags=["User"])
def update_user(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Обновить профиль текущего пользователя"""
    return service.update_user(user.id, payload.dict(exclude_unset=True))

@router.get("/stats", tags=["User"])
def get_user_stats(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить статистику пользователя"""
    return service.get_user_stats(user.id)

@router.get("/activity", tags=["User"])
def get_user_activity(
    days: int = Query(30, ge=1, le=365),
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить активность пользователя по дням"""
    return service.get_user_activity(user.id, days)
```

#### Course Endpoints

```python
@router.get("/courses", tags=["Courses"])
def get_courses(
    service: DatabaseService = Depends(get_db_service),
    user: User = Depends(get_current_user_optional)
) -> dict:
    """Получить все курсы"""
    courses = service.get_courses()
    return {"items": courses, "total": len(courses)}

@router.get("/courses/{course_id}", tags=["Courses"])
def get_course(
    course_id: int,
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить детали курса"""
    course = service.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
```

#### Mission Endpoints

```python
@router.get("/missions", tags=["Missions"])
def get_missions(
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить все миссии"""
    missions = service.get_missions()
    return {"items": missions, "total": len(missions)}

@router.post("/missions/{mission_id}/submit", tags=["Missions"])
def submit_mission(
    mission_id: str,
    payload: MissionSubmit,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Отправить решение миссии"""
    # Валидация кода и выполнение тестов
    result = service.execute_mission(mission_id, payload.code, user.id)
    
    if result["success"]:
        # Увеличить XP и обновить уровень
        service.add_xp(user.id, result["xp_earned"])
    
    return result
```

#### Community Endpoints

```python
@router.get("/posts", tags=["Community"])
def get_posts(
    skip: int = 0,
    limit: int = 20,
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить посты сообщества"""
    posts = service.get_posts(skip=skip, limit=limit)
    return {"items": posts, "total": len(posts)}

@router.post("/posts", tags=["Community"])
def create_post(
    payload: PostCreate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Создать новый пост"""
    post = service.create_post(user.id, payload)
    return post

@router.post("/posts/{post_id}/like", tags=["Community"])
def like_post(
    post_id: int,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Лайкнуть пост"""
    post = service.like_post(post_id, user.id)
    return post

@router.get("/leaderboard", tags=["Community"])
def get_leaderboard(
    scope: str = Query("global", regex="^(global|friends|school)$"),
    period: str = Query("all", regex="^(all|week|month)$"),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить таблицу лидеров"""
    leaderboard = service.get_leaderboard(scope=scope, period=period)
    return {"items": leaderboard, "total": len(leaderboard)}
```

#### Achievement Endpoints

```python
@router.get("/achievements", tags=["Achievements"])
def get_achievements(
    category: str | None = Query(None),
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить достижения пользователя"""
    achievements = service.get_user_achievements(user.id, category=category)
    return {"items": achievements, "total": len(achievements)}
```

#### System Endpoints

```python
@router.get("/uiData", tags=["System"])
def get_ui_data() -> dict:
    """Получить конфигурацию UI"""
    return DEFAULT_UI_DATA

@router.get("/logs", tags=["System"])
def get_logs(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Получить логи системы (только для админов)"""
    require_content_admin(user)
    return service.get_logs()
```

### Authentication Routes (api/auth_routes.py)

```python
@router.post("/register", response_model=Token, status_code=201)
def register(
    payload: UserRegister,
    request: Request,
    service: DatabaseService = Depends(get_db_service)
) -> Token:
    """Регистрация нового пользователя"""
    # Rate limiting (10 попыток за 10 минут)
    _enforce_rate_limit(request, "auth:register", limit=10, window_seconds=600)
    
    # Проверка уникальности
    if service.get_user_by_username(payload.username):
        raise HTTPException(status_code=409, detail="Username already taken")
    if service.get_user_by_email(payload.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Создание пользователя
    user = service.create_user(
        username=payload.username,
        email=payload.email,
        password=get_password_hash(payload.password),
        full_name=payload.full_name,
        name=payload.full_name.split()[0]
    )
    
    # Генерация JWT токена
    token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=token, user=user.to_dict())

@router.post("/login", response_model=Token)
def login(
    payload: UserLogin,
    request: Request,
    service: DatabaseService = Depends(get_db_service)
) -> Token:
    """Вход пользователя"""
    # Rate limiting (5 попыток за 5 минут)
    _enforce_rate_limit(request, "auth:login", limit=5, window_seconds=300)
    
    user = service.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=token, user=user.to_dict())

@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
) -> dict:
    """Изменить пароль"""
    db_user = service.get_user_by_id(user.id)
    
    if not verify_password(payload.old_password, db_user.password):
        raise HTTPException(status_code=401, detail="Old password incorrect")
    
    new_password_hash = get_password_hash(payload.new_password)
    service.update_user(
        user.id,
        {"password": new_password_hash}
    )
    
    return {"message": "Password changed successfully"}
```

### AI Routes (api/ai_routes.py)

```python
@router.post("/ai/chat", tags=["AI Chat"])
def chat(
    payload: ChatMessageRequest,
    user: User = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service)
) -> ChatResponse:
    """Отправить сообщение AI"""
    user_id = user.id if user else payload.user_id
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    
    response = ai_service.chat(user_id, payload.message)
    
    return ChatResponse(
        response=response,
        timestamp=datetime.now().isoformat()
    )

@router.post("/ai/quick-action", tags=["AI Chat"])
def quick_action(
    payload: QuickActionRequest,
    ai_service: AIService = Depends(get_ai_service)
) -> ChatResponse:
    """Быстрое действие (подсказка, мотивация и т.д.)"""
    prompts = {
        "hint": "Дай подсказку для решения этой задачи",
        "error": "Объясни эту ошибку кода",
        "theory": "Объясни эту концепцию Python",
        "motivation": "Дай мотивирующее сообщение"
    }
    
    message = prompts.get(payload.action_type, payload.action_type)
    response = ai_service.chat(payload.user_id, message)
    
    return ChatResponse(response=response, timestamp=datetime.now().isoformat())

@router.get("/ai/history", tags=["AI Chat"])
def get_history(
    user_id: str | None = None,
    chat_id: str | None = None,
    ai_service: AIService = Depends(get_ai_service)
) -> dict:
    """Получить историю чата"""
    history = ai_service.get_history(user_id, chat_id)
    
    return {
        "items": history,
        "active_chat_id": None,
        "chats": []
    }

@router.post("/ai/reset-session", tags=["AI Chat"])
def reset_session(
    user_id: str,
    ai_service: AIService = Depends(get_ai_service)
) -> dict:
    """Сбросить сессию чата"""
    ai_service.reset_session(user_id)
    
    return {"message": "Session reset", "user_id": user_id}
```

### Service Layer (services/)

#### DatabaseService (database_service.py)

Содержит всю бизнес-логику операций с БД:

```python
class DatabaseService:
    def __init__(self, db: Session):
        self.db = db
    
    # User operations
    def create_user(self, username: str, email: str, ...) -> User:
        """Создать пользователя"""
    
    def get_user_by_id(self, user_id: str) -> User:
        """Получить пользователя по ID"""
    
    def get_user_by_email(self, email: str) -> User | None:
        """Получить пользователя по email"""
    
    def update_user(self, user_id: str, data: dict) -> User:
        """Обновить данные пользователя"""
    
    def add_xp(self, user_id: str, xp: int) -> User:
        """Добавить XP и проверить повышение уровня"""
    
    # Mission operations
    def execute_mission(self, mission_id: str, code: str, user_id: str) -> dict:
        """
        1. Валидировать синтаксис Python
        2. Выполнить код в песочнице
        3. Сравнить вывод с test_cases
        4. Вернуть результат
        """
        # Проверка на заблокированные импорты и функции
        if self._has_blocked_imports(code):
            return {"success": False, "error": "Forbidden import"}
        
        # Выполнение в изолированной среде
        output = self._execute_python_code(code)
        
        # Проверка тестовых случаев
        test_results = self._validate_test_cases(output, test_cases)
        
        if all(test_results.values()):
            # XP награда
            xp_earned = mission.xp_reward
            self.add_xp(user_id, xp_earned)
            return {"success": True, "xp_earned": xp_earned}
        else:
            return {"success": False, "failed_tests": test_results}
    
    # Course operations
    def get_courses(self) -> list[Course]:
        """Получить все курсы"""
    
    def get_course(self, course_id: int) -> Course:
        """Получить курс по ID"""
    
    # Achievement operations
    def get_user_achievements(self, user_id: str, ...) -> list[Achievement]:
        """Получить достижения пользователя"""
    
    def check_achievements(self, user_id: str) -> None:
        """Проверить и разблокировать достижения"""
    
    # Leaderboard operations
    def get_leaderboard(self, scope: str, period: str) -> list[dict]:
        """Получить таблицу лидеров"""
    
    # Post operations
    def create_post(self, user_id: str, content: str, ...) -> Post:
        """Создать новый пост"""
    
    def like_post(self, post_id: int, user_id: str) -> Post:
        """Лайкнуть пост"""
    
    def get_posts(self, skip: int, limit: int) -> list[Post]:
        """Получить посты"""
```

**Ключевые особенности:**

- **Типизация**: Все методы имеют полные type hints
- **Валидация**: Проверка заблокированных импортов перед выполнением кода
- **Песочница**: Выполнение Python кода с ограничениями
- **Обработка ошибок**: Кастомные исключения и логирование

#### AIService (ai_service.py)

Интеграция с Google Gemini:

```python
class AIService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel("gemini-3-flash-preview")
    
    def chat(self, user_id: str, message: str) -> str:
        """Отправить сообщение в AI и получить ответ"""
        session = self.get_or_create_session(user_id)
        response = session.send_message(message)
        self.message_history[user_id].append({
            "sender": "user",
            "text": message,
            "timestamp": datetime.now().isoformat()
        })
        self.message_history[user_id].append({
            "sender": "ai",
            "text": response.text,
            "timestamp": datetime.now().isoformat()
        })
        return response.text
    
    def get_or_create_session(self, user_id: str) -> ChatSession:
        """Получить или создать сессию чата"""
        if user_id not in self.chat_sessions:
            self.chat_sessions[user_id] = self.model.start_chat(
                history=[
                    {"role": "user", "parts": [SYSTEM_PROMPT]},
                    {"role": "model", "parts": ["Понял!"]}
                ]
            )
        return self.chat_sessions[user_id]
    
    def reset_session(self, user_id: str) -> None:
        """Сбросить сессию пользователя"""
        if user_id in self.chat_sessions:
            del self.chat_sessions[user_id]
        if user_id in self.message_history:
            del self.message_history[user_id]
```

### Dependencies (api/dependencies.py)

```python
def get_current_user(token: str = Depends(HTTPBearer())) -> User:
    """Получить текущего аутентифицированного пользователя"""
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    service = next(get_db_service())
    user = service.get_user_by_id(user_id)
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def get_current_user_optional(token: str | None = Depends(...)) -> User | None:
    """Получить пользователя если авторизирован, иначе None"""
    if not token:
        return None
    try:
        return get_current_user(token)
    except HTTPException:
        return None

def get_db_service(db: Session = Depends(get_db)) -> DatabaseService:
    """Получить service для работы с БД"""
    return DatabaseService(db)

def get_ai_service() -> AIService:
    """Получить AI service"""
    return AIService()
```

---

## Аутентификация и безопасность

### JWT (JSON Web Tokens)

#### Создание токена

```python
from app.core.auth import create_access_token

token = create_access_token(data={"sub": user.id})

# Структура JWT:
# Header: {"alg": "HS256", "typ": "JWT"}
# Payload: {"sub": "user_id", "exp": timestamp}
# Signature: HMAC256(header.payload, SECRET_KEY)
```

#### Валидация токена

```python
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Хранение токена (Frontend)

```typescript
// Сохранение токена в localStorage
localStorage.setItem('token', token)

// Использование токена в запросах
const headers = {
  'Authorization': `Bearer ${token}`
}
```

### Password Security

#### Хеширование пароля

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Хеширование
hashed_password = get_password_hash(plain_password)

# Проверка
is_valid = verify_password(plain_password, hashed_password)
```

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Dev frontend
        "https://*.vercel.app",     # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

```python
from app.core.rate_limit import rate_limiter

def _enforce_rate_limit(request: Request, key_prefix: str, limit: int, window_seconds: int):
    ip = _client_ip(request)
    result = rate_limiter.check(f"{key_prefix}:{ip}", limit=limit, window_seconds=window_seconds)
    
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded",
            headers={"Retry-After": str(result.retry_after_seconds)}
        )

# Использование
_enforce_rate_limit(request, "auth:login", limit=5, window_seconds=300)
```

---

## База данных

### Конфигурация

#### SQLAlchemy Setup (core/database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Поддерживает SQLite и PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pypath.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### Connection Pooling

```python
# Для PostgreSQL (production)
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Проверка соединения перед использованием
    pool_recycle=3600    # Переиспользование соединений каждый час
)
```

### Миграции (Alembic)

#### Создание миграции

```bash
alembic revision --autogenerate -m "Add user table"
```

#### Применение миграций

```bash
alembic upgrade head
```

#### Откат

```bash
alembic downgrade -1
```

### Bootstrap (core/bootstrap.py)

Инициализация по умолчанию при запуске:

```python
def ensure_admin_account():
    """Создать админ аккаунт если его нет"""
    admin = service.get_user_by_username("admin_pypath")
    if not admin:
        service.create_user(
            username="admin_pypath",
            email="admin@pypath.local",
            password=get_password_hash("Admin12345!"),
            full_name="PyPath Admin",
            settings={"role": "admin", "is_admin": True}
        )

def ensure_default_courses():
    """Создать стандартные курсы"""
    courses = [
        {"title": "Python Basics", "difficulty": "easy", ...},
        {"title": "OOP in Python", "difficulty": "medium", ...},
        # ...
    ]
    for course_data in courses:
        if not service.get_course_by_title(course_data["title"]):
            service.create_course(course_data)

def ensure_default_missions():
    """Создать стандартные миссии"""
    missions = [
        {"title": "Hello World", "chapter": "Basics", ...},
        # ...
    ]
    for mission_data in missions:
        if not service.get_mission_by_title(mission_data["title"]):
            service.create_mission(mission_data)
```

---

## AI интеграция (Google Gemini)

### Google Generative AI

#### Конфигурация

```python
import google.generativeai as genai

genai.configure(api_key=settings.google_api_key)

model = genai.GenerativeModel(
    "gemini-3-flash-preview",
    generation_config=genai.types.GenerationConfig(
        max_output_tokens=1024,
        temperature=0.7,
        top_p=0.95,
        top_k=40
    )
)
```

#### System Prompt

```python
SYSTEM_PROMPT = """Ты - Оракул Кода, AI ассистент образовательной платформы PyPath.

Твоя роль:
- Помогать студентам понимать Python
- Объяснять ошибки простым языком
- Давать подсказки, не раскрывая решение
- Мотивировать учиться

Стиль:
- Дружелюбный и поддерживающий
- Используй аналогии и примеры
- Разбивай сложное на простое
"""
```

#### Chat Sessions

```python
class AIService:
    def __init__(self):
        self.chat_sessions: Dict[str, genai.ChatSession] = {}
        self.message_history: Dict[str, List[Dict]] = {}
    
    def get_or_create_session(self, user_id: str):
        if user_id not in self.chat_sessions:
            self.chat_sessions[user_id] = self.model.start_chat(
                history=[
                    {"role": "user", "parts": [SYSTEM_PROMPT]},
                    {"role": "model", "parts": ["Понял!"]}
                ]
            )
        return self.chat_sessions[user_id]
    
    def chat(self, user_id: str, message: str) -> str:
        session = self.get_or_create_session(user_id)
        response = session.send_message(message)
        
        # Сохранение в историю
        self.message_history[user_id].append({
            "sender": "user",
            "text": message,
            "timestamp": datetime.now().isoformat()
        })
        self.message_history[user_id].append({
            "sender": "ai",
            "text": response.text,
            "timestamp": datetime.now().isoformat()
        })
        
        return response.text
```

#### Quick Actions

```python
# Быстро доступные действия
{
    "hint": "Дай подсказку",
    "error": "Объясни ошибку",
    "theory": "Объясни теорию",
    "motivation": "Мотивирующее сообщение"
}
```

### Error Handling

```python
try:
    response = session.send_message(message)
except genai.errors.APIError as e:
    return {"error": "AI service unavailable"}
except Exception as e:
    logger.error(f"AI error: {e}")
    return {"error": "Something went wrong"}
```

---

## API эндпоинты

### Полный список

#### Health & System

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| GET | `/` | API info | ❌ |
| GET | `/health` | Health check | ❌ |
| GET | `/health/live` | Liveness probe | ❌ |
| GET | `/health/ready` | Readiness probe | ❌ |
| GET | `/uiData` | UI configuration | ❌ |

#### Authentication

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| POST | `/auth/register` | Регистрация | ❌ |
| POST | `/auth/login` | Вход | ❌ |
| GET | `/auth/me` | Текущий пользователь | ✅ |
| POST | `/auth/change-password` | Смена пароля | ✅ |

#### User

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| GET | `/currentUser` | Профиль | ✅ |
| PUT | `/currentUser` | Обновить профиль | ✅ |
| GET | `/stats` | Статистика | ✅ |
| GET | `/activity` | Активность по дням | ✅ |
| GET | `/skills` | Навыки пользователя | ✅ |

#### Courses & Missions

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| GET | `/courses` | Все курсы | ⚠️ |
| GET | `/courses/{id}` | Детали курса | ⚠️ |
| GET | `/missions` | Все миссии | ⚠️ |
| GET | `/missions/{id}` | Детали миссии | ⚠️ |
| POST | `/missions/{id}/submit` | Отправить решение | ✅ |

#### Community

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| GET | `/posts` | Посты | ⚠️ |
| POST | `/posts` | Создать пост | ✅ |
| POST | `/posts/{id}/like` | Лайкнуть | ✅ |
| GET | `/friends` | Друзья | ✅ |
| GET | `/leaderboard` | Лидерборд | ⚠️ |

#### Achievements

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| GET | `/achievements` | Достижения | ✅ |

#### AI Chat

| Метод | Endpoint | Описание | Auth |
|-------|----------|---------|------|
| POST | `/ai/chat` | Отправить сообщение | ⚠️ |
| POST | `/ai/quick-action` | Быстрое действие | ⚠️ |
| GET | `/ai/history` | История чата | ⚠️ |
| POST | `/ai/reset-session` | Сбросить сессию | ⚠️ |

**Legend:**
- ✅ = Требуется JWT токен
- ⚠️ = Опциональный токен
- ❌ = Публичный

### Примеры запросов

#### Регистрация

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'

# Ответ
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "name": "John",
    "level": "Новичок",
    "levelNum": 1,
    "xp": 0
  }
}
```

#### Отправка решения

```bash
curl -X POST http://localhost:8000/missions/101/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def factorial(n):\n  if n <= 1:\n    return 1\n  return n * factorial(n-1)"
  }'

# Ответ
{
  "success": true,
  "xp_earned": 50,
  "message": "All tests passed!"
}
```

#### AI Chat

```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Как работают функции в Python?",
    "user_id": "user123"
  }'

# Ответ
{
  "response": "Функция в Python — это блок кода, который выполняет определённую задачу...",
  "timestamp": "2024-03-23T10:30:00Z"
}
```

---

## Деплой и инфраструктура

### Development Environment

#### Frontend

```bash
cd PyPath
npm install
npm run dev
# Vite dev server: http://localhost:5173
```

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API: http://localhost:8000
# Swagger: http://localhost:8000/docs
```

### Production Deployment

#### Frontend (Vercel)

```bash
# vercel.json конфигурация
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api-proxy/(.*)",
      "destination": "http://94.131.92.125:8000/$1"
    }
  ]
}

# Deploy команда
npm run build
vercel deploy --prod
```

#### Backend (Docker)

**Dockerfile:**

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pypath
      POSTGRES_USER: pypath
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://pypath:secure_password@postgres:5432/pypath
      JWT_SECRET_KEY: your_secret_key
      GOOGLE_API_KEY: your_gemini_api_key
    depends_on:
      - postgres
    command: uvicorn main:app --host 0.0.0.0 --port 8000

volumes:
  postgres_data:
```

**Запуск:**

```bash
docker compose up --build
```

### Environment Variables

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend (.env)

```env
# Database
DATABASE_URL=sqlite:///./pypath.db
# или для PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/pypath

# Security
JWT_SECRET_KEY=your_super_secret_key_change_this

# AI
GOOGLE_API_KEY=your_gemini_api_key_from_google_cloud

# CORS
CORS_ORIGINS=["http://localhost:5173", "https://your-domain.vercel.app"]

# Admin bootstrap
ADMIN_USERNAME=admin_pypath
ADMIN_EMAIL=admin@pypath.local
ADMIN_PASSWORD=Admin12345!
```

---

## Разработка и тестирование

### Backend Testing

#### Test Structure

```bash
backend/
├── tests/
│   ├── test_api.py        # API endpoint tests
│   ├── test_auth.py       # Authentication tests
│   ├── test_missions.py   # Mission execution tests
│   └── conftest.py        # Fixtures
```

#### Running Tests

```bash
cd backend
pytest -v                   # Verbose output
pytest -q                   # Quiet output
pytest --cov              # With coverage
```

#### Example Test

```python
import pytest
from fastapi.testclient import TestClient
from app.main import create_app

client = TestClient(create_app())

def test_register():
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    assert response.json()["user"]["username"] == "testuser"

def test_login():
    # Сначала регистрация
    client.post("/auth/register", json={...})
    
    # Потом логин
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "TestPass123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_courses():
    response = client.get("/courses")
    assert response.status_code == 200
    assert "items" in response.json()
```

### Debugging

#### Backend Debugging

```python
# С помощью print или logger
import logging
logger = logging.getLogger(__name__)

logger.info(f"User created: {user.id}")
logger.error(f"Error: {str(e)}")

# Или с debugger
import pdb; pdb.set_trace()
```

#### Frontend Debugging

```typescript
// Console logs
console.log('User logged in:', user)
console.error('API error:', error)

// Breakpoints в DevTools
debugger

// React DevTools extension
```

---

## Конфигурация

### Settings (backend/app/core/config.py)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "PyPath Backend API"
    app_version: str = "1.1.0"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./pypath.db"
    
    # JWT
    jwt_secret_key: str = ""
    
    # Google AI
    google_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    
    # Admin bootstrap
    admin_username: str = "admin_pypath"
    admin_email: str = "admin@pypath.local"
    admin_password: str = "Admin12345!"
    admin_name: str = "PyPath Admin"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
```

### Vite Config (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## Best Practices

### Frontend Best Practices

#### 1. Component Organization

```typescript
// ✅ Good
components/
├── Dashboard/
│   ├── Dashboard.tsx
│   ├── DashboardCard.tsx
│   └── dashboard.types.ts
├── Editor/
│   ├── Editor.tsx
│   ├── EditorTerminal.tsx
│   └── editor.utils.ts

// ❌ Avoid
components/
├── Dashboard.tsx
├── DashboardCard.tsx
├── Editor.tsx
├── EditorTerminal.tsx
```

#### 2. Props Interface

```typescript
// ✅ Good
interface DashboardProps {
  userId: string
  onNavigate: (view: View) => void
  theme: 'light' | 'dark'
}

// ❌ Avoid
interface Props {
  a: string
  b: Function
  c: any
}
```

#### 3. Error Handling

```typescript
// ✅ Good
try {
  const user = await apiGet('/currentUser')
  setUser(user)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  showToast(message, 'error')
}

// ❌ Avoid
const user = await apiGet('/currentUser')  // No error handling
setUser(user)
```

#### 4. Avoid Prop Drilling

```typescript
// ✅ Good - Use Context for deeply passed props
const NotificationContext = React.createContext<NotificationContextType>(...)

// Or pass directly
<Dashboard currentUser={user} />

// ❌ Avoid
<Dashboard user={user} setUser={setUser} theme={theme} ... />
```

#### 5. Lazy Load Heavy Components

```typescript
// ✅ Good
const AdminPanel = lazy(() => import('./AdminPanel').then(mod => ({ default: mod.AdminPanel })))

<Suspense fallback={<div>Loading...</div>}>
  <AdminPanel />
</Suspense>

// ❌ Avoid
import AdminPanel from './AdminPanel'  // Always loaded
```

### Backend Best Practices

#### 1. Use Dependency Injection

```python
# ✅ Good
@router.get("/users/{user_id}")
def get_user(
    user_id: str,
    service: DatabaseService = Depends(get_db_service),
    user: User = Depends(get_current_user)
) -> dict:
    return service.get_user(user_id)

# ❌ Avoid
@router.get("/users/{user_id}")
def get_user(user_id: str) -> dict:
    db = SessionLocal()
    return db.query(User).filter(User.id == user_id).first()
```

#### 2. Type Hints

```python
# ✅ Good
from typing import Optional, List

def create_user(
    username: str,
    email: str,
    password: str
) -> User:
    pass

def get_users(limit: int = 10) -> List[User]:
    pass

def find_user(user_id: str) -> Optional[User]:
    pass

# ❌ Avoid
def create_user(username, email, password):
    pass
```

#### 3. Pydantic Validation

```python
# ✅ Good
from pydantic import BaseModel, Field, EmailStr, validator

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v

# ❌ Avoid
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
```

#### 4. Error Handling

```python
# ✅ Good
try:
    user = service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
except SQLAlchemyError as e:
    logger.error(f"Database error: {e}")
    raise HTTPException(status_code=500, detail="Database error")

# ❌ Avoid
user = service.get_user(user_id)
return user  # May crash if None
```

#### 5. Async Code

```python
# ✅ Good for I/O operations
from fastapi import FastAPI

app = FastAPI()

@app.get("/data")
async def get_data():
    data = await fetch_from_external_api()
    return data

# ✅ Good for CPU operations
from concurrent.futures import ThreadPoolExecutor

@app.post("/process")
async def process():
    result = await run_in_thread_pool(heavy_computation)
    return result
```

### Security Best Practices

#### 1. Password Security

```python
# ✅ Good - Use bcrypt with salt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])
hashed = pwd_context.hash(password)
is_correct = pwd_context.verify(password, hashed)

# ❌ Avoid
import hashlib
hashed = hashlib.md5(password).hexdigest()  # Insecure!
```

#### 2. JWT Configuration

```python
# ✅ Good
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Very long random string
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 3600  # 1 hour

# ❌ Avoid
JWT_SECRET_KEY = "secret"  # Too simple
JWT_EXPIRATION = 31536000  # 1 year - too long
```

#### 3. Input Validation

```python
# ✅ Good
from pydantic import BaseModel, validator

class MissionSubmit(BaseModel):
    code: str = Field(..., max_length=10000)
    
    @validator('code')
    def validate_code(cls, v):
        if v.strip() == "":
            raise ValueError("Code cannot be empty")
        return v

# ❌ Avoid
def submit_solution(code: str):
    execute(code)  # No validation!
```

#### 4. SQL Injection Prevention

```python
# ✅ Good - Use ORM or parameterized queries
user = db.query(User).filter(User.email == email).first()

# ❌ Avoid
query = f"SELECT * FROM users WHERE email = '{email}'"
user = db.execute(query)
```

---

## Часто задаваемые вопросы

### Q: Как добавить новый курс?

**A:** 

1. **Через API (для админов)**:
```bash
curl -X POST http://localhost:8000/courses \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "title": "Advanced Python",
    "description": "...",
    "difficulty": "hard",
    "icon": "CodeIcon",
    "color": "#FF6B6B"
  }'
```

2. **Через bootstrap** (backend/app/core/bootstrap.py):
```python
def ensure_default_courses():
    courses = [
        {
            "title": "My New Course",
            "description": "...",
            "difficulty": "medium",
            "icon": "BookOpen",
            "color": "#4ECDC4"
        }
    ]
    for course_data in courses:
        if not service.get_course_by_title(course_data["title"]):
            service.create_course(course_data)
```

### Q: Как кастомизировать AI подсказки?

**A:** Измените SYSTEM_PROMPT в `backend/app/services/ai_service.py`:

```python
self.system_prompt = """Ты - Оракул Кода, измененный для своих целей...

Твои специальные инструкции здесь.
"""
```

### Q: Как добавить новую тему оформления?

**A:**

```typescript
// 1. Добавьте в types.ts
type Theme = 'light' | 'dark' | 'sepia'

// 2. Обновите CSS переменные
/* sepia theme */
.sepia {
  --color-bg: #f4f1de;
  --color-text: #2d2d2d;
  --color-primary: #e76f51;
}

// 3. Используйте в компонентах
<div className={`bg-sepia-50 dark:bg-sepia-900 ${theme === 'sepia' ? 'sepia' : ''}`}>
```

### Q: Как запустить тесты?

**A:**

```bash
# Backend
cd backend
pytest -v                    # Все тесты
pytest -k test_auth -v      # Только тесты auth
pytest --cov               # С покрытием

# Frontend (если добавить Jest)
npm test
npm test -- --coverage
```

### Q: Как добавить новый язык?

**A:**

1. **Обновите constants.tsx**:
```typescript
type AppLanguage = 'ru' | 'kz' | 'en'

const UI_TEXTS = {
  app: {
    welcomePrefix: {
      ru: 'Добро пожаловать',
      kz: 'Қош келдіңіз',
      en: 'Welcome'
    }
  }
}
```

2. **Обновите компоненты**:
```typescript
const message = language === 'kz' 
  ? 'Қазақша сөз'
  : language === 'en'
  ? 'English word'
  : 'Русское слово'
```

### Q: Как отключить код-сандбокс для локального тестирования?

**A:**

```python
# В DatabaseService.execute_mission()
def execute_mission(self, ...):
    if not settings.enable_sandbox:
        # Прямое выполнение (опасно!)
        exec(code)
    else:
        # Защищённое выполнение
        self._safe_execute(code)
```

### Q: Как интегрировать с внешними API?

**A:**

```python
# 1. Создайте сервис
# backend/app/services/external_service.py
class ExternalAPIService:
    async def fetch_data(self):
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.example.com/data")
            return response.json()

# 2. Добавьте в роут
@router.get("/external-data")
async def get_external_data(
    service: ExternalAPIService = Depends(get_external_service)
):
    data = await service.fetch_data()
    return data
```

### Q: Как получить логи приложения?

**A:**

```bash
# Смотреть логи Docker контейнера
docker logs pypath-backend

# Со следованием (tail -f)
docker logs -f pypath-backend

# Последние 100 строк
docker logs --tail=100 pypath-backend
```

### Q: Как увеличить лимит на отправку больших кодов?

**A:**

```python
# backend/app/services/database_service.py
MAX_CODE_LENGTH = 50000  # было 10000

# backend/app/schemas/requests.py
class MissionSubmit(BaseModel):
    code: str = Field(..., max_length=MAX_CODE_LENGTH)
```

---

## Дополнительные ресурсы

### Документация

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Google Generative AI](https://ai.google.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [xterm.js](https://xtermjs.org/)

### Полезные инструменты

- **Postman** — тестирование API
- **VS Code** — разработка
- **Docker Desktop** — локальная контейнеризация
- **pgAdmin** — управление PostgreSQL
- **Swagger UI** — документация API

---

**Документация актуальна на 23 марта 2026 года. Последнее обновление: версия 1.1.0**

