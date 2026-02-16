from __future__ import annotations

from app.core.database import SessionLocal
from app.models.models import Course


DEFAULT_COURSES = [
    {
        "id": 1,
        "title": "Глава 1: Основы Python",
        "description": "Переменные, типы данных, ввод и вывод. Базовые элементы синтаксиса Python.",
        "progress": 0,
        "total_lessons": 8,
        "icon": "Terminal",
        "color": "text-arcade-success",
        "difficulty": "Базовый",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 2,
        "title": "Глава 2: Условия и ветвления",
        "description": "Операторы if/elif/else, логические выражения и принятие решений в коде.",
        "progress": 0,
        "total_lessons": 10,
        "icon": "Key",
        "color": "text-arcade-action",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 3,
        "title": "Глава 3: Циклы и итерации",
        "description": "Циклы for/while, range, break/continue и эффективный перебор данных.",
        "progress": 0,
        "total_lessons": 12,
        "icon": "Ghost",
        "color": "text-purple-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 4,
        "title": "Глава 4: Структуры данных",
        "description": "Списки, кортежи, множества и словари. Работа с коллекциями в Python.",
        "progress": 0,
        "total_lessons": 14,
        "icon": "Database",
        "color": "text-blue-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": True,
    },
    {
        "id": 5,
        "title": "Глава 5: Функции и модули",
        "description": "Создание функций, параметры, области видимости и организация кода по модулям.",
        "progress": 0,
        "total_lessons": 12,
        "icon": "Zap",
        "color": "text-yellow-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": True,
    },
    {
        "id": 6,
        "title": "БОСС: Практический проект",
        "description": "Соберите мини-проект и примените изученные темы в одном реальном задании.",
        "progress": 0,
        "total_lessons": 1,
        "icon": "Skull",
        "color": "text-red-500",
        "difficulty": "Босс",
        "stars": 0,
        "is_boss": True,
        "locked": True,
    },
]


def ensure_default_courses() -> None:
    db = SessionLocal()
    try:
        has_courses = db.query(Course).first() is not None
        if has_courses:
            return

        for course_data in DEFAULT_COURSES:
            db.add(Course(**course_data))

        db.commit()
    finally:
        db.close()
