from __future__ import annotations

from uuid import uuid4

from app.core.auth import get_password_hash
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.models import Course, Mission, User


DEFAULT_COURSES = [
    {
        "id": 1,
        "title": "Глава 1: Первые шаги",
        "description": "Что такое Python, как запускать команды и как выводить текст на экран.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Terminal",
        "color": "text-arcade-success",
        "difficulty": "Очень лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 2,
        "title": "Глава 2: Переменные и числа",
        "description": "Учимся хранить числа в переменных и выполнять простые вычисления.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Key",
        "color": "text-arcade-action",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 3,
        "title": "Глава 3: Условия if",
        "description": "Учимся принимать решения: если условие верно — выполняем нужный код.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Ghost",
        "color": "text-purple-400",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 4,
        "title": "Глава 4: Циклы for",
        "description": "Повторяем команды несколько раз и проходим по спискам.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Database",
        "color": "text-blue-400",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 5,
        "title": "Глава 5: Функции",
        "description": "Создаём свои команды (функции), чтобы код был аккуратным и понятным.",
        "progress": 0,
        "total_lessons": 1,
        "icon": "Zap",
        "color": "text-yellow-400",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 6,
        "title": "БОСС: Мини-игра",
        "description": "Соберите мини-проект из изученных блоков: вывод, условия, цикл и функция.",
        "progress": 0,
        "total_lessons": 1,
        "icon": "Skull",
        "color": "text-red-500",
        "difficulty": "Босс",
        "stars": 0,
        "is_boss": True,
        "locked": False,
    },
]


DEFAULT_MISSIONS = [
    {
        "id": "g1-m1",
        "title": "Привет, мир",
        "chapter": "Глава 1",
        "description": "Напишите программу, которая выводит строку «Привет, мир!».",
        "difficulty": "Лёгкий",
        "xp_reward": 15,
        "objectives": [
            {"id": 1, "text": "Выведите текст Привет, мир!", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "# Напиши команду print ниже\n",
        "test_cases": [
            {"id": "tc_output", "type": "output_contains", "value": "Привет, мир!", "label": "Есть нужный вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без runtime ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Команда print выводит текст на экран. Текст нужно писать в кавычках.",
            "Используйте print('Привет, мир!')",
        ],
    },
    {
        "id": "g1-m2",
        "title": "Представься",
        "chapter": "Глава 1",
        "description": "Выведи в консоль своё имя и класс в одной строке.",
        "difficulty": "Лёгкий",
        "xp_reward": 20,
        "objectives": [
            {"id": 1, "text": "Выведите своё имя", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "name = 'Миша'\nklass = '5А'\n# Выведи name и klass\n",
        "test_cases": [
            {"id": "tc_output", "type": "output_regex", "value": ".+", "label": "Есть любой вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без runtime ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Можно хранить текст в переменных и выводить их через print.",
            "Попробуйте print(name, klass)",
        ],
    },
    {
        "id": "g2-m1",
        "title": "Сложение чисел",
        "chapter": "Глава 2",
        "description": "Сложи два числа и выведи результат.",
        "difficulty": "Лёгкий",
        "xp_reward": 20,
        "objectives": [
            {"id": 1, "text": "Выведите результат сложения", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "a = 7\nb = 5\n# Создай переменную result и выведи её\n",
        "test_cases": [
            {"id": "tc_output", "type": "output_contains", "value": "12", "label": "Вывод содержит 12", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Сумму чисел можно сохранить в новую переменную: result = a + b.",
            "После вычисления сделай print(result)",
        ],
    },
    {
        "id": "g2-m2",
        "title": "Умножение и вывод",
        "chapter": "Глава 2",
        "description": "Умножь числа и выведи правильный ответ.",
        "difficulty": "Лёгкий",
        "xp_reward": 20,
        "objectives": [
            {"id": 1, "text": "Выведите результат умножения", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "x = 3\ny = 4\n# Выведи x * y\n",
        "test_cases": [
            {"id": "tc_output", "type": "output_contains", "value": "12", "label": "Вывод содержит 12", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Для умножения используют знак *",
            "Можно сразу написать print(x * y)",
        ],
    },
    {
        "id": "g3-m1",
        "title": "Проверка возраста",
        "chapter": "Глава 3",
        "description": "Если возраст больше или равен 10, выведи 'Можно'. Иначе — 'Пока рано'.",
        "difficulty": "Лёгкий",
        "xp_reward": 25,
        "objectives": [
            {"id": 1, "text": "Используйте if", "testCaseId": "tc_if", "completed": False},
            {"id": 2, "text": "Сделайте вывод в консоль", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "age = 11\n# Напиши условие if\n",
        "test_cases": [
            {"id": "tc_if", "type": "code_regex", "value": "\\bif\\b", "flags": "m", "label": "Есть условие if", "points": 1},
            {"id": "tc_output", "type": "output_contains", "value": "Можно", "label": "Правильный вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:if помогает выбрать действие в зависимости от условия.",
            "Проверь условие age >= 10",
        ],
    },
    {
        "id": "g3-m2",
        "title": "Чётное или нечётное",
        "chapter": "Глава 3",
        "description": "Определи, чётное число или нет, и выведи ответ.",
        "difficulty": "Лёгкий",
        "xp_reward": 25,
        "objectives": [
            {"id": 1, "text": "Проверьте остаток от деления", "testCaseId": "tc_mod", "completed": False},
            {"id": 2, "text": "Сделайте вывод", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "n = 8\n# Если число четное, выведи ЧЕТНОЕ\n",
        "test_cases": [
            {"id": "tc_mod", "type": "code_regex", "value": "%\\s*2", "flags": "m", "label": "Есть проверка на чётность", "points": 1},
            {"id": "tc_output", "type": "output_contains", "value": "ЧЕТНОЕ", "label": "Вывод содержит ЧЕТНОЕ", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Остаток от деления проверяют через знак %",
            "n % 2 == 0 означает чётное число",
        ],
    },
    {
        "id": "g4-m1",
        "title": "Повтори 3 раза",
        "chapter": "Глава 4",
        "description": "Выведи слово Python три раза с помощью цикла for.",
        "difficulty": "Лёгкий",
        "xp_reward": 30,
        "objectives": [
            {"id": 1, "text": "Используйте цикл for", "testCaseId": "tc_for", "completed": False},
            {"id": 2, "text": "Выведите Python", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "# Используй range(3)\n",
        "test_cases": [
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\b", "flags": "m", "label": "Есть цикл for", "points": 1},
            {"id": "tc_output", "type": "output_contains", "value": "Python", "label": "Есть вывод Python", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Цикл for повторяет действия несколько раз.",
            "Попробуй: for i in range(3):",
        ],
    },
    {
        "id": "g4-m2",
        "title": "Пройдись по списку",
        "chapter": "Глава 4",
        "description": "Создай список фруктов и выведи каждый фрукт в новой строке.",
        "difficulty": "Лёгкий",
        "xp_reward": 30,
        "objectives": [
            {"id": 1, "text": "Создайте список", "testCaseId": "tc_list", "completed": False},
            {"id": 2, "text": "Пройдитесь циклом по списку", "testCaseId": "tc_for", "completed": False},
        ],
        "starter_code": "fruits = ['яблоко', 'банан', 'груша']\n# Выведи каждый фрукт\n",
        "test_cases": [
            {"id": "tc_list", "type": "code_regex", "value": "\\[[^\\]]+\\]", "flags": "m", "label": "Есть список", "points": 1},
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\s+\\w+\\s+in\\s+fruits", "flags": "m", "label": "Есть цикл по fruits", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Список хранит несколько значений сразу.",
            "for fruit in fruits: print(fruit)",
        ],
    },
    {
        "id": "g5-m1",
        "title": "Первая функция",
        "chapter": "Глава 5",
        "description": "Создай функцию hello() и выведи в ней текст Привет!",
        "difficulty": "Лёгкий",
        "xp_reward": 35,
        "objectives": [
            {"id": 1, "text": "Создайте функцию hello", "testCaseId": "tc_func", "completed": False},
            {"id": 2, "text": "Вызовите функцию", "testCaseId": "tc_call", "completed": False},
        ],
        "starter_code": "# Создай функцию hello\n",
        "test_cases": [
            {"id": "tc_func", "type": "code_regex", "value": "def\\s+hello\\s*\\(", "flags": "m", "label": "Функция hello есть", "points": 1},
            {"id": "tc_call", "type": "code_regex", "value": "hello\\s*\\(", "flags": "m", "label": "Функция вызвана", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Функция — это своя команда, которую можно запускать много раз.",
            "Сначала def hello():, затем hello()",
        ],
    },
    {
        "id": "g6-m1",
        "title": "Мини-проект: привет-помощник",
        "chapter": "Глава 6",
        "description": "Собери мини-программу: функция + цикл + красивый вывод.",
        "difficulty": "Средний",
        "xp_reward": 50,
        "objectives": [
            {"id": 1, "text": "Создайте функцию", "testCaseId": "tc_func", "completed": False},
            {"id": 2, "text": "Используйте цикл", "testCaseId": "tc_for", "completed": False},
            {"id": 3, "text": "Сделайте вывод", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "name = 'друг'\n# Сделай мини-проект\n",
        "test_cases": [
            {"id": "tc_func", "type": "code_regex", "value": "def\\s+", "flags": "m", "label": "Есть функция", "points": 1},
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\b", "flags": "m", "label": "Есть цикл", "points": 1},
            {"id": "tc_output", "type": "output_regex", "value": ".+", "label": "Есть вывод в консоль", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется без ошибок", "points": 1},
        ],
        "hints": [
            "__THEORY__:Проект — это когда используешь сразу несколько изученных инструментов.",
            "Сделай функцию, а в цикле вызови её несколько раз",
        ],
    },
]


def ensure_default_courses() -> None:
    db = SessionLocal()
    try:
        for course_data in DEFAULT_COURSES:
            existing = db.query(Course).filter(Course.id == course_data["id"]).first()
            if existing:
                existing.title = course_data["title"]
                existing.description = course_data["description"]
                existing.progress = course_data["progress"]
                existing.total_lessons = course_data["total_lessons"]
                existing.icon = course_data["icon"]
                existing.color = course_data["color"]
                existing.difficulty = course_data["difficulty"]
                existing.stars = course_data["stars"]
                existing.is_boss = course_data["is_boss"]
                existing.locked = course_data["locked"]
            else:
                db.add(Course(**course_data))

        db.commit()
    finally:
        db.close()


def ensure_default_missions() -> None:
    db = SessionLocal()
    try:
        for mission_data in DEFAULT_MISSIONS:
            existing = db.query(Mission).filter(Mission.id == mission_data["id"]).first()
            if existing:
                existing.title = mission_data["title"]
                existing.chapter = mission_data["chapter"]
                existing.description = mission_data["description"]
                existing.difficulty = mission_data["difficulty"]
                existing.xp_reward = mission_data["xp_reward"]
                existing.objectives = mission_data["objectives"]
                existing.starter_code = mission_data["starter_code"]
                existing.test_cases = mission_data["test_cases"]
                existing.hints = mission_data["hints"]
            else:
                db.add(Mission(**mission_data))

        db.commit()
    finally:
        db.close()


def ensure_admin_account() -> None:
    settings = get_settings()
    admin_username = (getattr(settings, "admin_username", "") or "admin_pypath").strip()
    admin_email = (getattr(settings, "admin_email", "") or "admin@pypath.local").strip().lower()
    admin_password = getattr(settings, "admin_password", "") or "Admin12345!"
    admin_name = (getattr(settings, "admin_name", "") or "PyPath Admin").strip()

    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.username == admin_username).first()
        if not admin_user and admin_email:
            admin_user = db.query(User).filter(User.email == admin_email).first()

        if admin_user:
            current_settings = admin_user.settings if isinstance(admin_user.settings, dict) else {}
            admin_user.settings = {
                **current_settings,
                "role": "admin",
                "is_admin": True,
            }
            admin_user.full_name = admin_name
            admin_user.name = admin_name
            if admin_password:
                admin_user.password = get_password_hash(admin_password)
        else:
            db.add(
                User(
                    id=f"u_admin_{uuid4().hex[:12]}",
                    username=admin_username,
                    email=admin_email,
                    password=get_password_hash(admin_password),
                    full_name=admin_name,
                    name=admin_name,
                    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=PyPathAdmin",
                    bio="Администратор PyPath",
                    level="Admin",
                    level_num=99,
                    xp=99999,
                    max_xp=100000,
                    streak=0,
                    rank=1,
                    league="Admin",
                    settings={
                        "theme": "dark",
                        "notifications": True,
                        "sound": True,
                        "role": "admin",
                        "is_admin": True,
                    },
                )
            )

        db.commit()
    finally:
        db.close()
