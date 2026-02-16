from __future__ import annotations

from app.core.database import SessionLocal
from app.models.models import Course, Mission


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


DEFAULT_MISSIONS = [
    {
        "id": "mission-1",
        "title": "Проверка портов",
        "chapter": "Глава 1",
        "description": "Создайте список ports, пройдитесь циклом for и выведите проверку каждого порта.",
        "difficulty": "Лёгкий",
        "xp_reward": 40,
        "objectives": [
            {"id": 1, "text": "Создайте список ports", "testCaseId": "tc_ports_list", "completed": False},
            {"id": 2, "text": "Используйте цикл for", "testCaseId": "tc_for_loop", "completed": False},
            {"id": 3, "text": "Выведите сообщение проверки порта", "testCaseId": "tc_output", "completed": False},
            {"id": 4, "text": "Верните ACCESS GRANTED", "testCaseId": "tc_access", "completed": False},
        ],
        "starter_code": "ports = [22, 80, 443]\n\n# your code here\n",
        "test_cases": [
            {"id": "tc_ports_list", "type": "code_regex", "value": "\\bports\\s*=\\s*\\[[^\\]]+\\]", "flags": "m", "label": "Создан список ports", "points": 1},
            {"id": "tc_for_loop", "type": "code_regex", "value": "\\bfor\\s+\\w+\\s+in\\s+ports\\b", "flags": "m", "label": "Добавлен цикл for по ports", "points": 1},
            {"id": "tc_output", "type": "code_regex", "value": "\\bprint\\s*\\([^\\)]*port[^\\)]*\\)", "flags": "im", "label": "Выводится сообщение проверки порта", "points": 1},
            {"id": "tc_access", "type": "code_regex", "value": "\\breturn\\s+[\"']ACCESS GRANTED[\"']", "flags": "m", "label": "Возвращается ACCESS GRANTED", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без runtime ошибок", "points": 1},
        ],
        "hints": [
            "Используйте for port in ports",
            "Сделайте print для каждого порта",
            "Создайте функцию, которая возвращает ACCESS GRANTED",
        ],
    },
    {
        "id": "mission-2",
        "title": "Сканер сервиса",
        "chapter": "Глава 1",
        "description": "Проверьте список ports и выведите статус сервиса для каждого значения.",
        "difficulty": "Лёгкий",
        "xp_reward": 45,
        "objectives": [
            {"id": 1, "text": "Создайте список ports", "testCaseId": "tc_ports_list", "completed": False},
            {"id": 2, "text": "Используйте цикл for", "testCaseId": "tc_for_loop", "completed": False},
            {"id": 3, "text": "Выведите сообщение проверки порта", "testCaseId": "tc_output", "completed": False},
            {"id": 4, "text": "Верните ACCESS GRANTED", "testCaseId": "tc_access", "completed": False},
        ],
        "starter_code": "ports = [21, 25, 110]\n\n# your code here\n",
        "test_cases": [
            {"id": "tc_ports_list", "type": "code_regex", "value": "\\bports\\s*=\\s*\\[[^\\]]+\\]", "flags": "m", "label": "Создан список ports", "points": 1},
            {"id": "tc_for_loop", "type": "code_regex", "value": "\\bfor\\s+\\w+\\s+in\\s+ports\\b", "flags": "m", "label": "Добавлен цикл for по ports", "points": 1},
            {"id": "tc_output", "type": "code_regex", "value": "\\bprint\\s*\\([^\\)]*port[^\\)]*\\)", "flags": "im", "label": "Выводится сообщение проверки порта", "points": 1},
            {"id": "tc_access", "type": "code_regex", "value": "\\breturn\\s+[\"']ACCESS GRANTED[\"']", "flags": "m", "label": "Возвращается ACCESS GRANTED", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без runtime ошибок", "points": 1},
        ],
        "hints": [
            "Список ports обязателен",
            "Добавьте печать статуса",
            "Финальный результат: ACCESS GRANTED",
        ],
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


def ensure_default_missions() -> None:
    db = SessionLocal()
    try:
        has_missions = db.query(Mission).first() is not None
        if has_missions:
            return

        for mission_data in DEFAULT_MISSIONS:
            db.add(Mission(**mission_data))

        db.commit()
    finally:
        db.close()
