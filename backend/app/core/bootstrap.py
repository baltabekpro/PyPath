from __future__ import annotations

from uuid import uuid4
from datetime import datetime

from app.core.auth import get_password_hash
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.locales import COURSE_TRANSLATIONS, translate_ru_to_kz
from app.models.models import Course, Mission, User, LeaderboardEntry


DEFAULT_COURSES = [
    {
        "id": 1,
        "title": "Глава 1: Старт в Python",
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
        "title": "Глава 2: Переменные и типы",
        "description": "Учимся хранить данные в переменных и понимать их типы.",
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
        "title": "Глава 3: Условия if / else",
        "description": "Учимся принимать решения: если условие верно — выполняем нужный код, иначе идём в другую ветку.",
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
        "title": "Глава 4: Циклы for / while",
        "description": "Повторяем команды несколько раз и учимся работать с повторением и диапазонами.",
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
        "title": "Глава 5: Функции и параметры",
        "description": "Создаём свои команды (функции), чтобы код был аккуратным, понятным и переиспользуемым.",
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
        "title": "БОСС: Мини-проект",
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
    {
        "id": 7,
        "title": "Глава 7: Одномерные массивы",
        "description": "Работаем со списками: ввод, вывод и базовые операции с элементами.",
        "progress": 0,
        "total_lessons": 3,
        "icon": "Layers",
        "color": "text-cyan-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 8,
        "title": "Глава 8: Операции с массивами",
        "description": "Учимся переставлять, сортировать, удалять и вставлять элементы в списках.",
        "progress": 0,
        "total_lessons": 3,
        "icon": "Box",
        "color": "text-indigo-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 9,
        "title": "Глава 9: Двумерные массивы",
        "description": "Изучаем матрицы: доступ по индексам, обход строк и столбцов.",
        "progress": 0,
        "total_lessons": 3,
        "icon": "Database",
        "color": "text-teal-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 10,
        "title": "Глава 10: Введение в PyGame",
        "description": "Запускаем окно игры, создаем фон и выводим персонажа.",
        "progress": 0,
        "total_lessons": 3,
        "icon": "Cpu",
        "color": "text-green-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 11,
        "title": "Глава 11: Спрайты и столкновения",
        "description": "Добавляем управление, движение и распознавание столкновений.",
        "progress": 0,
        "total_lessons": 3,
        "icon": "ShieldAlert",
        "color": "text-orange-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 12,
        "title": "БОСС: 2D игра на Python",
        "description": "Соберите полноценную мини-игру на PyGame, используя все темы раздела.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Skull",
        "color": "text-red-500",
        "difficulty": "Босс",
        "stars": 0,
        "is_boss": True,
        "locked": False,
    },
    {
        "id": 13,
        "title": "Глава 13: Работа с файлами",
        "description": "Чтение и запись текстовых файлов, обработка строк и логов.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Terminal",
        "color": "text-emerald-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 14,
        "title": "Глава 14: Словари и структуры данных",
        "description": "Используем dict, наборы и вложенные структуры для хранения данных.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Layers",
        "color": "text-violet-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 15,
        "title": "Глава 15: ООП в Python",
        "description": "Создаем классы, объекты и методы для более крупной архитектуры программ.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Cpu",
        "color": "text-fuchsia-400",
        "difficulty": "Сложный",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 16,
        "title": "БОСС: API и финальный проект",
        "description": "Соберите проект с файлами, структурами данных и ООП, добавив простое API-взаимодействие.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Skull",
        "color": "text-red-500",
        "difficulty": "Босс",
        "stars": 0,
        "is_boss": True,
        "locked": False,
    },
    {
        "id": 17,
        "title": "Глава 17: Python для 8 класса",
        "description": "Укрепляем базу 8 класса: условия, циклы и мини-задачи на алгоритмику.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "BookOpen",
        "color": "text-sky-400",
        "difficulty": "Лёгкий",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
    {
        "id": 18,
        "title": "Глава 18: Python для 8/9 класса",
        "description": "Переходный модуль 8/9: функции, списки и практические задачи со смешанными темами.",
        "progress": 0,
        "total_lessons": 2,
        "icon": "Route",
        "color": "text-lime-400",
        "difficulty": "Средний",
        "stars": 0,
        "is_boss": False,
        "locked": False,
    },
]


COURSE_CONTENT_PROFILES = {
    1: {
        "focus": "вывод текста и запуск программы",
        "intro": "Первые шаги в Python начинаются с понимания того, как программа печатает результат и как она вообще запускается.",
        "sections": [
            "Команда print() выводит текст, числа и значения переменных. Это базовый способ показать результат работы кода.",
            "Строки нужно оборачивать в кавычки, а простой код лучше проверять маленькими кусками, чтобы быстрее видеть ошибки.",
        ],
        "example": 'print("Привет, Python!")\nname = "Алия"\nprint("Меня зовут", name)',
        "takeaways": ["print() выводит данные", "Строки пишутся в кавычках", "Первый код должен быть коротким и проверяемым"],
        "reward": {"xp": 40, "badge": "Старт Python", "icon": "Award", "medal": "Terminal"},
    },
    2: {
        "focus": "переменные и типы данных",
        "intro": "Переменные позволяют сохранить данные и использовать их позже, а типы подсказывают, как именно эти данные можно обрабатывать.",
        "sections": [
            "Переменная — это имя, за которым стоит значение. Если значение нужно в нескольких местах, его лучше сохранить в переменную.",
            "Числа, строки и логические значения ведут себя по-разному, поэтому при работе с ними важно понимать тип данных.",
        ],
        "example": 'name = "Алия"\nage = 14\nprint(name, age)\nprint(type(age))',
        "takeaways": ["Переменная хранит значение", "Тип влияет на операции", "type() помогает проверять данные"],
        "reward": {"xp": 45, "badge": "Переменные", "icon": "Key", "medal": "Variables"},
    },
    3: {
        "focus": "ветвления if / else",
        "intro": "Условия позволяют программе выбирать разные действия в зависимости от результата проверки.",
        "sections": [
            "Блок if выполняется только тогда, когда условие истинно. Если условие ложно, можно перейти в else.",
            "Сравнение строится на операторах >, <, >=, <=, == и !=. Частая ошибка — забыть двоеточие и отступы.",
        ],
        "example": 'age = 14\nif age >= 14:\n    print("Можно участвовать")\nelse:\n    print("Пока рано")',
        "takeaways": ["if выбирает ветку", "else даёт альтернативу", "Сравнения строятся на операторах"],
        "reward": {"xp": 50, "badge": "Логика", "icon": "Shield", "medal": "IfElse"},
    },
    4: {
        "focus": "циклы for и while",
        "intro": "Циклы нужны, когда одно и то же действие должно повторяться несколько раз.",
        "sections": [
            "for удобен, когда известен диапазон или последовательность элементов. while подходит для повторения до тех пор, пока условие остаётся истинным.",
            "При работе с while важно следить за условием выхода, иначе цикл может стать бесконечным.",
        ],
        "example": 'for number in range(3):\n    print(number)\n\ncount = 3\nwhile count > 0:\n    count -= 1',
        "takeaways": ["for повторяет по диапазону", "while повторяет по условию", "Нужно предусматривать выход из цикла"],
        "reward": {"xp": 55, "badge": "Циклы", "icon": "RefreshCw", "medal": "Loops"},
    },
    5: {
        "focus": "функции и параметры",
        "intro": "Функции помогают собирать повторяющийся код в отдельные блоки и делать программу понятнее.",
        "sections": [
            "Функция создаётся через def. Параметры дают возможность передавать в неё данные.",
            "return возвращает результат наружу. Если код повторяется дважды, его уже стоит вынести в функцию.",
        ],
        "example": 'def add(a, b):\n    return a + b\n\nprint(add(2, 3))',
        "takeaways": ["def создаёт функцию", "Параметры передают данные", "return возвращает результат"],
        "reward": {"xp": 60, "badge": "Функции", "icon": "Zap", "medal": "Functions"},
    },
    6: {
        "focus": "мини-проект и связка базовых навыков",
        "intro": "Мини-проект проверяет, умеет ли ученик соединять вывод, переменные, условия, циклы и функции в одну программу.",
        "sections": [
            "Сначала полезно собрать маленький сценарий: ввод данных, проверка условия и вывод результата.",
            "Хороший мини-проект всегда можно разбить на отдельные шаги и проверить каждый шаг отдельно.",
        ],
        "example": 'def greet(name):\n    print("Привет", name)\n\nfor _ in range(3):\n    greet("друг")',
        "takeaways": ["Мини-проект связывает базовые темы", "Каждый шаг стоит проверять отдельно", "Функции помогают собирать проект"],
        "reward": {"xp": 70, "badge": "Мини-проект", "icon": "Sword", "medal": "Project"},
    },
    7: {
        "focus": "списки и доступ к элементам",
        "intro": "Списки нужны, когда данные идут в порядке и к каждому элементу можно обратиться по индексу.",
        "sections": [
            "Список хранит последовательность значений. Его удобно использовать для учеников, оценок, товаров и любых наборов данных.",
            "Обращение по индексу начинается с нуля, поэтому первый элемент списка всегда находится по индексу 0.",
        ],
        "example": 'students = ["Алия", "Бекзат", "Мира"]\nprint(students[0])\nprint(students[-1])',
        "takeaways": ["Список хранит порядок", "Индексация начинается с нуля", "Отрицательные индексы берут элементы с конца"],
        "reward": {"xp": 60, "badge": "Списки", "icon": "Layers", "medal": "Lists"},
    },
    8: {
        "focus": "операции со списками",
        "intro": "После знакомства со списками важно научиться добавлять, удалять, менять и сортировать элементы.",
        "sections": [
            "Методы append(), insert() и remove() помогают управлять содержимым списка без ручного пересоздания.",
            "Сортировка и перебор списков используются почти в каждом реальном проекте, где данные нужно обработать по порядку.",
        ],
        "example": 'numbers = [3, 1, 2]\nnumbers.append(4)\nnumbers.sort()\nprint(numbers)',
        "takeaways": ["append добавляет в конец", "remove удаляет по значению", "sort упорядочивает список"],
        "reward": {"xp": 65, "badge": "Операции со списками", "icon": "Boxes", "medal": "ListOps"},
    },
    9: {
        "focus": "двумерные массивы и матрицы",
        "intro": "Двумерные массивы помогают хранить таблицы, шахматные поля, сетки и любую структуру с строками и столбцами.",
        "sections": [
            "Матрица — это список списков. Чтобы добраться до ячейки, нужно указать индекс строки и столбца.",
            "При обходе таблиц важно помнить, что внешний цикл обычно идёт по строкам, а внутренний — по элементам строки.",
        ],
        "example": 'matrix = [[1, 2], [3, 4]]\nprint(matrix[0][1])\nfor row in matrix:\n    for value in row:\n        print(value)',
        "takeaways": ["Матрица — список списков", "К элементу обращаются двумя индексами", "Вложенные циклы обходят таблицы"],
        "reward": {"xp": 70, "badge": "Матрицы", "icon": "Grid2x2", "medal": "Matrices"},
    },
    10: {
        "focus": "основы PyGame и игровое окно",
        "intro": "PyGame открывает путь к графическим программам, где код управляет окном, спрайтами и движением объектов.",
        "sections": [
            "Сначала создаётся окно и игровой цикл. Затем добавляются фон, персонаж и ввод с клавиатуры.",
            "Даже в простой игре важно отделять логику обновления экрана от обработки событий.",
        ],
        "example": 'import pygame\npygame.init()\nscreen = pygame.display.set_mode((800, 600))\npygame.display.set_caption("PyPath Game")',
        "takeaways": ["PyGame работает через игровой цикл", "Первым создают окно", "События и отрисовка должны быть разделены"],
        "reward": {"xp": 75, "badge": "PyGame", "icon": "Gamepad2", "medal": "GameWindow"},
    },
    11: {
        "focus": "спрайты, движение и столкновения",
        "intro": "Когда окно игры уже работает, следующий шаг — научиться двигать объекты и проверять столкновения.",
        "sections": [
            "Спрайт — это объект с изображением и координатами. Он может двигаться, падать, прыгать и сталкиваться с другими объектами.",
            "Проверка столкновений позволяет понять, когда герой коснулся стены, врага или бонуса.",
        ],
        "example": 'player_rect = pygame.Rect(50, 50, 40, 40)\nwall_rect = pygame.Rect(120, 50, 40, 40)\nprint(player_rect.colliderect(wall_rect))',
        "takeaways": ["Спрайт имеет координаты", "colliderect проверяет столкновение", "Движение строится на изменении координат"],
        "reward": {"xp": 80, "badge": "Столкновения", "icon": "ShieldAlert", "medal": "Collisions"},
    },
    12: {
        "focus": "сборка 2D-игры",
        "intro": "Финальная игра соединяет всё изученное: окно, персонажей, управление, препятствия и завершение уровня.",
        "sections": [
            "В проекте важно разбить работу на части: фон, персонаж, цели, проигрыш и победа.",
            "Хороший игровой проект всегда можно расширить новыми уровнями, счётом и простым интерфейсом.",
        ],
        "example": 'score = 0\nlevel_finished = False\nif score >= 10:\n    level_finished = True',
        "takeaways": ["Проект должен иметь цель", "Игра строится по частям", "Уровень завершает проверка условий"],
        "reward": {"xp": 100, "badge": "Игра", "icon": "Trophy", "medal": "GameProject"},
    },
    13: {
        "focus": "чтение и запись файлов",
        "intro": "Файлы позволяют хранить данные между запусками программы: списки, оценки, логи и отчёты.",
        "sections": [
            "Открывая файл через with open(...), вы автоматически закрываете его после завершения блока.",
            "Чтение и запись в текстовый файл помогают сохранять результат работы программы на диск.",
        ],
        "example": 'with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("Привет, файл")',
        "takeaways": ["with open безопаснее обычного open", "Файл можно читать и писать", "Данные сохраняются между запусками"],
        "reward": {"xp": 75, "badge": "Файлы", "icon": "FileText", "medal": "Files"},
    },
    14: {
        "focus": "словари и наборы",
        "intro": "Словари связывают ключ и значение, а множества помогают быстро проверять уникальность элементов.",
        "sections": [
            "Словарь удобен, когда данные нужно искать по имени поля: профиль, настройки, счёт.",
            "set помогает избавиться от повторов и быстро проверять наличие элемента.",
        ],
        "example": 'profile = {"name": "Алия", "score": 95}\nunique_tags = {"python", "fastapi"}\nprint(profile["score"])',
        "takeaways": ["Словарь хранит ключ и значение", "set убирает дубликаты", "По ключу можно быстро искать данные"],
        "reward": {"xp": 80, "badge": "Структуры данных", "icon": "Database", "medal": "DictSet"},
    },
    15: {
        "focus": "объектно-ориентированное программирование",
        "intro": "ООП помогает описывать реальные сущности через классы, объекты и методы.",
        "sections": [
            "Класс задаёт шаблон объекта, а объект хранит конкретные данные и умеет выполнять методы.",
            "ООП делает код крупного проекта понятнее, потому что объединяет данные и поведение в одном месте.",
        ],
        "example": 'class Student:\n    def __init__(self, name):\n        self.name = name\n\nstudent = Student("Алия")',
        "takeaways": ["Класс — шаблон объекта", "Методы работают с данными объекта", "ООП упрощает крупные программы"],
        "reward": {"xp": 85, "badge": "ООП", "icon": "Cpu", "medal": "OOP"},
    },
    16: {
        "focus": "API и финальный проект",
        "intro": "Финальный модуль соединяет файлы, структуры данных, ООП и внешнее взаимодействие через API.",
        "sections": [
            "На практике это уже небольшой сервис или приложение с данными, интерфейсом и логикой обработки запросов.",
            "Важнее всего здесь научиться собирать проект из знакомых частей и проверять работу каждого слоя отдельно.",
        ],
        "example": 'import requests\nresponse = requests.get("https://example.com/api")\nprint(response.status_code)',
        "takeaways": ["Финальный проект использует много тем сразу", "API позволяет общаться с внешними сервисами", "Крупный проект нужно собирать по слоям"],
        "reward": {"xp": 120, "badge": "Финальный проект", "icon": "Rocket", "medal": "APIProject"},
    },
    17: {
        "focus": "алгоритмика для 8 класса",
        "intro": "Этот модуль укрепляет базовые темы через короткие алгоритмические задачи и простые проверки условий.",
        "sections": [
            "Здесь важно быстро читать условие, переводить его в шаги и выбирать нужную конструкцию Python.",
            "Чем меньше лишнего кода в решении, тем легче отследить ошибку и довести задачу до результата.",
        ],
        "example": 'number = int(input())\nif number % 2 == 0:\n    print("even")\nelse:\n    print("odd")',
        "takeaways": ["Алгоритм сначала описывают шагами", "Условия помогают принимать решения", "Короткие решения проще проверять"],
        "reward": {"xp": 55, "badge": "8 класс", "icon": "BookOpen", "medal": "Grade8"},
    },
    18: {
        "focus": "переход между 8 и 9 классом",
        "intro": "Переходный модуль помогает соединить уже знакомые конструкции с более крупными задачами и новыми структурами данных.",
        "sections": [
            "В этом блоке полезно повторить условия, циклы, функции и списки, а потом собрать из них практическое решение.",
            "Чем лучше вы умеете комбинировать базовые темы, тем легче переходить к задачам следующего уровня.",
        ],
        "example": 'def total(values):\n    return sum(values)\n\nprint(total([1, 2, 3]))',
        "takeaways": ["Переходный модуль повторяет базу", "Сложные задачи собираются из простых", "Функции и списки нужны чаще всего"],
        "reward": {"xp": 65, "badge": "Переход", "icon": "Route", "medal": "Transition"},
    },
}


def _localized_course_meta(course_id: int, title: str, description: str) -> dict:
    return COURSE_TRANSLATIONS.get("kz", {}).get(course_id, {
        "title": title,
        "description": description,
        "section": "8/9 сыныпқа дайындық",
    })


def _translate_example(example: str) -> str:
    value = translate_ru_to_kz(example)
    example_replacements = [
        ("Привет, Python!", "Сәлем, Python!"),
        ("Меня зовут", "Менің атым"),
        ("Можно участвовать", "Қатысуға болады"),
        ("Пока рано", "Әлі ерте"),
        ("Привет", "Сәлем"),
        ("друг", "дос"),
        ("Разбор темы", "Тақырыпты талдау"),
        ("Тақырыпты меңгеру", "Тақырыпты меңгеру"),
        ("Привет, файл", "Сәлем, файл"),
        ("Тақырыпты", "Тақырыпты"),
    ]
    for source, target in example_replacements:
        value = value.replace(source, target)
    return value


def _build_theory_content(course_id: int, title: str, description: str, profile: dict, language: str) -> dict:
    if language == "kz":
        meta = _localized_course_meta(course_id, title, description)
        sections = [
            f"Бұл бөлімде {meta.get('section') or meta.get('title') or title} тақырыбының негізгі идеясын қарастырамыз.",
        ]
        sections.extend(
            translate_ru_to_kz(str(section)) for section in (profile.get("sections") or [])
        )
        if not sections:
            sections = [translate_ru_to_kz(str(description))]
        return {
            "intro": str(meta.get("description") or translate_ru_to_kz(str(profile.get("intro") or description))),
            "sections": sections,
            "example": _translate_example(str(profile.get("example") or "print('Сәлем, Python!')")),
            "takeaways": [
                translate_ru_to_kz(str(item)) for item in (profile.get("takeaways") or [meta.get("section") or title])
            ],
            "focus": translate_ru_to_kz(str(profile.get("focus") or description)),
        }

    return {
        "intro": str(profile.get("intro") or f"Подробный разбор темы {title} поможет пройти от базовой идеи к уверенной практике."),
        "sections": list(profile.get("sections") or [description]),
        "example": str(profile.get("example") or "print('Пример')"),
        "takeaways": list(profile.get("takeaways") or [profile.get("focus") or description]),
        "focus": str(profile.get("focus") or description),
    }


def _build_quiz_bank(course_id: int, title: str, description: str, profile: dict, language: str) -> list[dict]:
    focus = str(profile.get("focus") or description or title)
    intro = str(profile.get("intro") or description or title)
    if language == "kz":
        meta = _localized_course_meta(course_id, title, description)
        localized_title = str(meta.get("title") or title)
        localized_focus = translate_ru_to_kz(focus)
        localized_intro = translate_ru_to_kz(intro)
        return [
            {
                "id": f"course-{course_id}-q1",
                "question": f"{localized_title} тақырыбының негізгі идеясы қандай?",
                "options": [
                    localized_focus,
                    "Синтаксисті жаттап алып, практика жасамау",
                    "Кездейсоқ командаларды пайдалану",
                    "Бағдарлама нәтижесін елемеу",
                ],
                "correct_index": 0,
                "explanation": f"Бұл курс {localized_title} {localized_focus} түсінігіне сүйенеді.",
            },
            {
                "id": f"course-{course_id}-q2",
                "question": f"«{localized_title}» курсында алдымен нені түсіну керек?",
                "options": [
                    localized_intro,
                    "Бірден үлкен жобаны тексерусіз жазу",
                    "Тек комментарийлерді қолдану",
                    "Python-дағы шегіністерді өшіру",
                ],
                "correct_index": 0,
                "explanation": "Алдымен негізгі ойды түсініп, содан кейін оны қысқа мысалмен бекіткен дұрыс.",
            },
            {
                "id": f"course-{course_id}-q3",
                "question": f"{localized_title} тақырыбын үйренуде қай тәсіл тиімді?",
                "options": [
                    "Алдымен теория, кейін қысқа мысал, соңында практика",
                    "Бірден үлкен жобаға көшу",
                    "Тек командалардың атын жаттау",
                    "Теориядан кейін тесттерді өткізіп жіберу",
                ],
                "correct_index": 0,
                "explanation": "Білім теориядан практикаға біртіндеп өткенде жақсы бекітіледі.",
            },
            {
                "id": f"course-{course_id}-q4",
                "question": f"{localized_title} кезінде қателерден не сақтайды?",
                "options": [
                    "Шешімді шағын қадамдарға бөлу",
                    "Кодты тексерусіз жазу",
                    "Түсініксіз жерлерді түсіндірмесіз қалдыру",
                    "Әр қателіктен кейін тақырыпты ауыстыру",
                ],
                "correct_index": 0,
                "explanation": "Қысқа және тексерілетін қадамдар қатені тезірек табуға көмектеседі.",
            },
            {
                "id": f"course-{course_id}-q5",
                "question": f"{localized_title} тақырыбы меңгерілді екенін не көрсетеді?",
                "options": [
                    "Идеяны түсіндіріп, қысқа жұмыс істейтін мысал жаза алу",
                    "Тақырыптан бір сөз ғана еске түсіру",
                    "Курс бетін ашу",
                    "Практиканы өткізіп жіберу",
                ],
                "correct_index": 0,
                "explanation": "Тақырыпты түсінген адам оны түсіндіріп, мысалда қолдана алады.",
            },
        ]

    return [
        {
            "id": f"course-{course_id}-q1",
            "question": f"Какова главная идея темы {title}?",
            "options": [
                focus,
                "Только запомнить синтаксис без практики",
                "Использовать случайные команды",
                "Игнорировать результат программы",
            ],
            "correct_index": 0,
            "explanation": f"Тема курса {title} строится вокруг понятия: {focus}.",
        },
        {
            "id": f"course-{course_id}-q2",
            "question": f"Что чаще всего нужно сначала понять в курсе «{title}»?",
            "options": [
                intro,
                "Сразу писать большой проект без проверки шагов",
                "Использовать только комментарии",
                "Отключить отступы в Python",
            ],
            "correct_index": 0,
            "explanation": "Сначала важно понять базовую идею, затем закрепить её на маленьких примерах.",
        },
        {
            "id": f"course-{course_id}-q3",
            "question": f"Какой подход лучше всего работает при изучении темы {title}?",
            "options": [
                "Сначала теория, потом короткий пример, затем практика",
                "Сразу переходить к огромному проекту",
                "Выучить только названия команд",
                "Пропускать тесты после теории",
            ],
            "correct_index": 0,
            "explanation": "Быстрее всего знания закрепляются, когда теория сразу проверяется на практике.",
        },
        {
            "id": f"course-{course_id}-q4",
            "question": f"Что помогает избежать ошибок при работе с темой {title}?",
            "options": [
                "Разбивать решение на маленькие шаги",
                "Писать код без проверки",
                "Оставлять непонятные участки без комментариев к логике",
                "Менять тему после каждой ошибки",
            ],
            "correct_index": 0,
            "explanation": "Короткие и проверяемые шаги позволяют быстрее локализовать ошибку.",
        },
        {
            "id": f"course-{course_id}-q5",
            "question": f"Какой результат показывает, что тема {title} уже усвоена?",
            "options": [
                "Можно объяснить идею и написать короткий рабочий пример",
                "Можно вспомнить одно слово из темы",
                "Можно открыть страницу курса",
                "Можно пропустить практику",
            ],
            "correct_index": 0,
            "explanation": "Усвоение темы видно, когда вы умеете объяснить её и применить на примере.",
        },
    ]


def build_course_content(course_id: int, title: str, description: str, total_lessons: int) -> dict:
    profile = COURSE_CONTENT_PROFILES.get(course_id, {})
    reward = dict(profile.get("reward") or {})
    xp_value = int(reward.get("xp") or max(30, total_lessons * 15))

    return {
        "theory_content": {
            "ru": _build_theory_content(course_id, title, description, profile, "ru"),
            "kz": _build_theory_content(course_id, title, description, profile, "kz"),
        },
        "quiz_bank": {
            "ru": _build_quiz_bank(course_id, title, description, profile, "ru"),
            "kz": _build_quiz_bank(course_id, title, description, profile, "kz"),
        },
        "reward_preview": {
            "xp": xp_value,
            "badge": translate_ru_to_kz(str(reward.get("badge") or title)),
            "icon": reward.get("icon") or "Award",
            "medal": translate_ru_to_kz(str(reward.get("medal") or "Medal")),
        },
    }


def ensure_course_content_columns() -> None:
    from sqlalchemy import inspect, text
    from app.core.database import _get_engine

    engine = _get_engine()
    inspector = inspect(engine)
    if "courses" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("courses")}
    required_columns = {
        "theory_content": "JSON",
        "quiz_bank": "JSON",
        "reward_preview": "JSON",
    }

    with engine.begin() as connection:
        for column_name, column_type in required_columns.items():
            if column_name in existing_columns:
                continue
            connection.execute(text(f"ALTER TABLE courses ADD COLUMN {column_name} {column_type}"))


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
    {
        "id": "g7-m1",
        "title": "Создай список чисел",
        "chapter": "Глава 7",
        "description": "Создай список из 5 чисел и выведи его длину.",
        "difficulty": "Средний",
        "xp_reward": 35,
        "objectives": [
            {"id": 1, "text": "Создайте список", "testCaseId": "tc_list", "completed": False},
            {"id": 2, "text": "Выведите длину", "testCaseId": "tc_len", "completed": False},
        ],
        "starter_code": "numbers = [3, 7, 2, 9, 5]\n# Выведи длину списка\n",
        "test_cases": [
            {"id": "tc_list", "type": "code_regex", "value": "\\[[^\\]]+\\]", "flags": "m", "label": "Есть список", "points": 1},
            {"id": "tc_len", "type": "code_regex", "value": "len\\s*\\(", "flags": "m", "label": "Используется len", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "__THEORY__:Список хранит несколько элементов одного или разных типов.",
            "Длина списка вычисляется функцией len(numbers)",
        ],
    },
    {
        "id": "g7-m2",
        "title": "Ввод в список",
        "chapter": "Глава 7",
        "description": "Считай 3 числа через input и сохрани их в список.",
        "difficulty": "Средний",
        "xp_reward": 35,
        "objectives": [
            {"id": 1, "text": "Используйте input", "testCaseId": "tc_input", "completed": False},
            {"id": 2, "text": "Добавьте значения в список", "testCaseId": "tc_append", "completed": False},
        ],
        "starter_code": "values = []\n# Считай 3 числа\n",
        "test_cases": [
            {"id": "tc_input", "type": "code_regex", "value": "input\\s*\\(", "flags": "m", "label": "Есть input", "points": 1},
            {"id": "tc_append", "type": "code_regex", "value": "append\\s*\\(", "flags": "m", "label": "Есть append", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используйте values.append(int(input()))",
            "После ввода выведите список на экран",
        ],
    },
    {
        "id": "g7-m3",
        "title": "Сумма элементов списка",
        "chapter": "Глава 7",
        "description": "Найди сумму всех элементов списка.",
        "difficulty": "Средний",
        "xp_reward": 40,
        "objectives": [
            {"id": 1, "text": "Используйте цикл", "testCaseId": "tc_for", "completed": False},
            {"id": 2, "text": "Посчитайте сумму", "testCaseId": "tc_sum", "completed": False},
        ],
        "starter_code": "nums = [4, 6, 10, 2]\n# Посчитай сумму\n",
        "test_cases": [
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\b", "flags": "m", "label": "Есть цикл", "points": 1},
            {"id": "tc_sum", "type": "code_regex", "value": "total|sum", "flags": "m", "label": "Есть переменная суммы", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Создай total = 0 и добавляй каждый элемент",
            "Можно использовать и встроенную функцию sum(nums)",
        ],
    },
    {
        "id": "g8-m1",
        "title": "Перестановка элементов",
        "chapter": "Глава 8",
        "description": "Поменяй местами первый и последний элементы списка.",
        "difficulty": "Средний",
        "xp_reward": 40,
        "objectives": [
            {"id": 1, "text": "Сделайте обмен элементов", "testCaseId": "tc_swap", "completed": False},
        ],
        "starter_code": "arr = [10, 20, 30, 40]\n# Поменяй местами первый и последний\n",
        "test_cases": [
            {"id": "tc_swap", "type": "code_regex", "value": "arr\\[0\\].*arr\\[-1\\]|arr\\[-1\\].*arr\\[0\\]", "flags": "m", "label": "Есть обмен", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Python позволяет обменивать: arr[0], arr[-1] = arr[-1], arr[0]",
            "Проверь результат через print(arr)",
        ],
    },
    {
        "id": "g8-m2",
        "title": "Сортировка списка",
        "chapter": "Глава 8",
        "description": "Отсортируй список по возрастанию и выведи результат.",
        "difficulty": "Средний",
        "xp_reward": 40,
        "objectives": [
            {"id": 1, "text": "Используйте сортировку", "testCaseId": "tc_sort", "completed": False},
        ],
        "starter_code": "arr = [9, 3, 7, 1]\n# Отсортируй список\n",
        "test_cases": [
            {"id": "tc_sort", "type": "code_regex", "value": "sort\\s*\\(|sorted\\s*\\(", "flags": "m", "label": "Есть сортировка", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используй arr.sort() или sorted(arr)",
            "Выведи отсортированный список",
        ],
    },
    {
        "id": "g8-m3",
        "title": "Удаление и вставка",
        "chapter": "Глава 8",
        "description": "Удалите один элемент и вставьте новый на нужную позицию.",
        "difficulty": "Средний",
        "xp_reward": 45,
        "objectives": [
            {"id": 1, "text": "Удалите элемент", "testCaseId": "tc_remove", "completed": False},
            {"id": 2, "text": "Вставьте элемент", "testCaseId": "tc_insert", "completed": False},
        ],
        "starter_code": "items = [\"a\", \"b\", \"c\", \"d\"]\n# Удали и вставь элементы\n",
        "test_cases": [
            {"id": "tc_remove", "type": "code_regex", "value": "remove\\s*\\(|pop\\s*\\(", "flags": "m", "label": "Есть удаление", "points": 1},
            {"id": "tc_insert", "type": "code_regex", "value": "insert\\s*\\(", "flags": "m", "label": "Есть вставка", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Удалять можно через remove() или pop()",
            "Вставка делается через insert(index, value)",
        ],
    },
    {
        "id": "g9-m1",
        "title": "Создай матрицу",
        "chapter": "Глава 9",
        "description": "Создай двумерный список 3x3 и выведи первую строку.",
        "difficulty": "Средний",
        "xp_reward": 45,
        "objectives": [
            {"id": 1, "text": "Создайте матрицу", "testCaseId": "tc_matrix", "completed": False},
            {"id": 2, "text": "Выведите первую строку", "testCaseId": "tc_row", "completed": False},
        ],
        "starter_code": "matrix = [[1,2,3],[4,5,6],[7,8,9]]\n# Выведи первую строку\n",
        "test_cases": [
            {"id": "tc_matrix", "type": "code_regex", "value": "\\[\\s*\\[", "flags": "m", "label": "Есть двумерный список", "points": 1},
            {"id": "tc_row", "type": "code_regex", "value": "matrix\\[0\\]", "flags": "m", "label": "Есть доступ к первой строке", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Двумерный список это список строк",
            "Первая строка доступна через matrix[0]",
        ],
    },
    {
        "id": "g9-m2",
        "title": "Сумма строки матрицы",
        "chapter": "Глава 9",
        "description": "Посчитай сумму элементов второй строки матрицы.",
        "difficulty": "Средний",
        "xp_reward": 45,
        "objectives": [
            {"id": 1, "text": "Выберите вторую строку", "testCaseId": "tc_index", "completed": False},
            {"id": 2, "text": "Посчитайте сумму", "testCaseId": "tc_sum", "completed": False},
        ],
        "starter_code": "matrix = [[2,4,6],[1,3,5],[7,8,9]]\n# Найди сумму второй строки\n",
        "test_cases": [
            {"id": "tc_index", "type": "code_regex", "value": "matrix\\[1\\]", "flags": "m", "label": "Есть доступ ко второй строке", "points": 1},
            {"id": "tc_sum", "type": "code_regex", "value": "sum\\s*\\(", "flags": "m", "label": "Используется sum", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Вторая строка это matrix[1]",
            "Используй sum(matrix[1])",
        ],
    },
    {
        "id": "g9-m3",
        "title": "Обход матрицы",
        "chapter": "Глава 9",
        "description": "Пройдись по всем элементам матрицы двойным циклом.",
        "difficulty": "Средний",
        "xp_reward": 50,
        "objectives": [
            {"id": 1, "text": "Используйте внешний цикл", "testCaseId": "tc_for1", "completed": False},
            {"id": 2, "text": "Используйте внутренний цикл", "testCaseId": "tc_for2", "completed": False},
        ],
        "starter_code": "matrix = [[1,2],[3,4]]\n# Обойди все элементы\n",
        "test_cases": [
            {"id": "tc_for1", "type": "code_regex", "value": "for\\s+\\w+\\s+in\\s+matrix", "flags": "m", "label": "Есть внешний цикл", "points": 1},
            {"id": "tc_for2", "type": "code_regex", "value": "for\\s+\\w+\\s+in\\s+\\w+", "flags": "m", "label": "Есть внутренний цикл", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Сначала цикл по строкам, потом по элементам строки",
            "Выводи каждый элемент через print(value)",
        ],
    },
    {
        "id": "g10-m1",
        "title": "Окно PyGame",
        "chapter": "Глава 10",
        "description": "Создай окно PyGame и не закрывай его мгновенно.",
        "difficulty": "Средний",
        "xp_reward": 50,
        "objectives": [
            {"id": 1, "text": "Импортируйте pygame", "testCaseId": "tc_import", "completed": False},
            {"id": 2, "text": "Создайте окно", "testCaseId": "tc_setmode", "completed": False},
        ],
        "starter_code": "import pygame\n# Создай окно 800x600\n",
        "test_cases": [
            {"id": "tc_import", "type": "code_regex", "value": "import\\s+pygame", "flags": "m", "label": "Есть импорт pygame", "points": 1},
            {"id": "tc_setmode", "type": "code_regex", "value": "set_mode\\s*\\(", "flags": "m", "label": "Есть создание окна", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Нужны pygame.init() и pygame.display.set_mode((800, 600))",
            "Добавьте цикл while running для окна",
        ],
    },
    {
        "id": "g10-m2",
        "title": "Фон игры",
        "chapter": "Глава 10",
        "description": "Задай цвет фона и обновляй экран каждый кадр.",
        "difficulty": "Средний",
        "xp_reward": 50,
        "objectives": [
            {"id": 1, "text": "Заполните фон цветом", "testCaseId": "tc_fill", "completed": False},
            {"id": 2, "text": "Обновите экран", "testCaseId": "tc_flip", "completed": False},
        ],
        "starter_code": "import pygame\n# Сделай цветной фон\n",
        "test_cases": [
            {"id": "tc_fill", "type": "code_regex", "value": "fill\\s*\\(", "flags": "m", "label": "Есть заливка фона", "points": 1},
            {"id": "tc_flip", "type": "code_regex", "value": "display\\.(flip|update)\\s*\\(", "flags": "m", "label": "Есть обновление экрана", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "screen.fill((r, g, b)) задает цвет фона",
            "Не забудьте pygame.display.flip()",
        ],
    },
    {
        "id": "g10-m3",
        "title": "Персонаж на экране",
        "chapter": "Глава 10",
        "description": "Нарисуй простого персонажа (прямоугольник) на экране.",
        "difficulty": "Средний",
        "xp_reward": 55,
        "objectives": [
            {"id": 1, "text": "Нарисуйте объект", "testCaseId": "tc_draw", "completed": False},
        ],
        "starter_code": "import pygame\n# Нарисуй прямоугольник-персонажа\n",
        "test_cases": [
            {"id": "tc_draw", "type": "code_regex", "value": "draw\\.(rect|circle)\\s*\\(", "flags": "m", "label": "Есть отрисовка", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используйте pygame.draw.rect(screen, color, (x, y, w, h))",
            "Рисование делайте внутри игрового цикла",
        ],
    },
    {
        "id": "g11-m1",
        "title": "Управление персонажем",
        "chapter": "Глава 11",
        "description": "Сделай движение персонажа по стрелкам клавиатуры.",
        "difficulty": "Средний",
        "xp_reward": 55,
        "objectives": [
            {"id": 1, "text": "Считайте клавиши", "testCaseId": "tc_keys", "completed": False},
            {"id": 2, "text": "Изменяйте координаты", "testCaseId": "tc_move", "completed": False},
        ],
        "starter_code": "import pygame\n# Добавь управление стрелками\n",
        "test_cases": [
            {"id": "tc_keys", "type": "code_regex", "value": "K_LEFT|K_RIGHT|key\\.get_pressed", "flags": "m", "label": "Есть обработка клавиш", "points": 1},
            {"id": "tc_move", "type": "code_regex", "value": r"x\\s*[+\-]=|y\\s*[+\-]=", "flags": "m", "label": "Есть изменение координат", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Скорость можно хранить в переменной speed",
            "Проверяйте нажатия через pygame.key.get_pressed()",
        ],
    },
    {
        "id": "g11-m2",
        "title": "Проверка столкновений",
        "chapter": "Глава 11",
        "description": "Создай два прямоугольника и проверь столкновение между ними.",
        "difficulty": "Средний",
        "xp_reward": 60,
        "objectives": [
            {"id": 1, "text": "Создайте два Rect", "testCaseId": "tc_rect", "completed": False},
            {"id": 2, "text": "Проверьте столкновение", "testCaseId": "tc_collide", "completed": False},
        ],
        "starter_code": "import pygame\n# Создай 2 прямоугольника и проверь пересечение\n",
        "test_cases": [
            {"id": "tc_rect", "type": "code_regex", "value": "pygame\\.Rect", "flags": "m", "label": "Есть Rect", "points": 1},
            {"id": "tc_collide", "type": "code_regex", "value": "colliderect\\s*\\(", "flags": "m", "label": "Есть проверка столкновения", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "collision = rect1.colliderect(rect2)",
            "При столкновении можно вывести сообщение",
        ],
    },
    {
        "id": "g11-m3",
        "title": "Игровое условие победы",
        "chapter": "Глава 11",
        "description": "Добавь условие победы при достижении цели.",
        "difficulty": "Средний",
        "xp_reward": 60,
        "objectives": [
            {"id": 1, "text": "Создайте условие победы", "testCaseId": "tc_if", "completed": False},
        ],
        "starter_code": "# Добавь условие победы\n",
        "test_cases": [
            {"id": "tc_if", "type": "code_regex", "value": "\\bif\\b", "flags": "m", "label": "Есть условие", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используй булев флаг won = True/False",
            "Покажи сообщение о победе в консоль или на экране",
        ],
    },
    {
        "id": "g12-m1",
        "title": "Каркас 2D-игры",
        "chapter": "Глава 12",
        "description": "Собери каркас игры: окно, цикл, отрисовка, управление.",
        "difficulty": "Сложный",
        "xp_reward": 70,
        "objectives": [
            {"id": 1, "text": "Создайте игровой цикл", "testCaseId": "tc_loop", "completed": False},
            {"id": 2, "text": "Добавьте отрисовку", "testCaseId": "tc_draw", "completed": False},
        ],
        "starter_code": "import pygame\n# Каркас игры\n",
        "test_cases": [
            {"id": "tc_loop", "type": "code_regex", "value": "while\\s+running", "flags": "m", "label": "Есть игровой цикл", "points": 1},
            {"id": "tc_draw", "type": "code_regex", "value": "draw\\.|blit\\s*\\(", "flags": "m", "label": "Есть отрисовка", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Подготовь переменные состояния игры",
            "Раздели код на init/update/render",
        ],
    },
    {
        "id": "g12-m2",
        "title": "Финальный мини-проект",
        "chapter": "Глава 12",
        "description": "Реализуй простую игру с движением, препятствиями и условием победы.",
        "difficulty": "Сложный",
        "xp_reward": 80,
        "objectives": [
            {"id": 1, "text": "Добавьте движение", "testCaseId": "tc_move", "completed": False},
            {"id": 2, "text": "Добавьте столкновения", "testCaseId": "tc_collide", "completed": False},
            {"id": 3, "text": "Добавьте победу/поражение", "testCaseId": "tc_if", "completed": False},
        ],
        "starter_code": "import pygame\n# Финальная игра\n",
        "test_cases": [
            {"id": "tc_move", "type": "code_regex", "value": "K_LEFT|K_RIGHT|K_UP|K_DOWN", "flags": "m", "label": "Есть управление", "points": 1},
            {"id": "tc_collide", "type": "code_regex", "value": "colliderect\\s*\\(", "flags": "m", "label": "Есть столкновения", "points": 1},
            {"id": "tc_if", "type": "code_regex", "value": "\\bif\\b", "flags": "m", "label": "Есть условия игры", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Сначала сделай рабочий минимум, потом добавляй детали",
            "Проверь, что цикл завершается корректно",
        ],
    },
    {
        "id": "g13-m1",
        "title": "Чтение файла",
        "chapter": "Глава 13",
        "description": "Прочитай содержимое текстового файла и выведи его в консоль.",
        "difficulty": "Средний",
        "xp_reward": 60,
        "objectives": [
            {"id": 1, "text": "Откройте файл", "testCaseId": "tc_open", "completed": False},
            {"id": 2, "text": "Выведите содержимое", "testCaseId": "tc_print", "completed": False},
        ],
        "starter_code": "# Прочитай файл data.txt\n",
        "test_cases": [
            {"id": "tc_open", "type": "code_regex", "value": "open\\s*\\(", "flags": "m", "label": "Есть open", "points": 1},
            {"id": "tc_print", "type": "code_regex", "value": "print\\s*\\(", "flags": "m", "label": "Есть вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используй with open('data.txt', 'r', encoding='utf-8') as f:",
            "Читай файл через f.read() или f.readlines()",
        ],
    },
    {
        "id": "g13-m2",
        "title": "Запись отчета в файл",
        "chapter": "Глава 13",
        "description": "Запиши результат вычислений в новый файл report.txt.",
        "difficulty": "Средний",
        "xp_reward": 65,
        "objectives": [
            {"id": 1, "text": "Откройте файл в режиме записи", "testCaseId": "tc_write_mode", "completed": False},
            {"id": 2, "text": "Запишите строку", "testCaseId": "tc_write", "completed": False},
        ],
        "starter_code": "result = 42\n# Запиши результат в report.txt\n",
        "test_cases": [
            {"id": "tc_write_mode", "type": "code_regex", "value": "open\\s*\\(.*['\"]w['\"]", "flags": "m", "label": "Есть режим записи", "points": 1},
            {"id": "tc_write", "type": "code_regex", "value": "write\\s*\\(", "flags": "m", "label": "Есть write", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Для записи нужен режим 'w' или 'a'",
            "f.write(str(result))",
        ],
    },
    {
        "id": "g14-m1",
        "title": "Словарь ученика",
        "chapter": "Глава 14",
        "description": "Создай словарь с именем, классом и баллом ученика.",
        "difficulty": "Средний",
        "xp_reward": 65,
        "objectives": [
            {"id": 1, "text": "Создайте словарь", "testCaseId": "tc_dict", "completed": False},
            {"id": 2, "text": "Выведите значение по ключу", "testCaseId": "tc_key", "completed": False},
        ],
        "starter_code": "# Создай словарь student\n",
        "test_cases": [
            {"id": "tc_dict", "type": "code_regex", "value": "\\{[^\\}]+\\}", "flags": "m", "label": "Есть dict", "points": 1},
            {"id": "tc_key", "type": "code_regex", "value": "\\[['\"][^'\"]+['\"]\\]", "flags": "m", "label": "Есть доступ по ключу", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Пример: student = {'name': 'Aliya', 'grade': 10}",
            "Доступ к ключу: student['name']",
        ],
    },
    {
        "id": "g14-m2",
        "title": "Частота слов",
        "chapter": "Глава 14",
        "description": "Подсчитай, сколько раз каждое слово встречается в строке.",
        "difficulty": "Сложный",
        "xp_reward": 70,
        "objectives": [
            {"id": 1, "text": "Используйте словарь для подсчета", "testCaseId": "tc_dict", "completed": False},
            {"id": 2, "text": "Пройдитесь циклом по словам", "testCaseId": "tc_for", "completed": False},
        ],
        "starter_code": "text = 'python code python game code'\n# Подсчитай частоту слов\n",
        "test_cases": [
            {"id": "tc_dict", "type": "code_regex", "value": "\\{\\}|dict\\s*\\(", "flags": "m", "label": "Есть словарь для частоты", "points": 1},
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\b", "flags": "m", "label": "Есть цикл", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Разбей текст через split()",
            "Обновляй счетчик: freq[word] = freq.get(word, 0) + 1",
        ],
    },
    {
        "id": "g15-m1",
        "title": "Класс Hero",
        "chapter": "Глава 15",
        "description": "Создай класс Hero с полями name и hp.",
        "difficulty": "Сложный",
        "xp_reward": 75,
        "objectives": [
            {"id": 1, "text": "Создайте класс", "testCaseId": "tc_class", "completed": False},
            {"id": 2, "text": "Добавьте конструктор", "testCaseId": "tc_init", "completed": False},
        ],
        "starter_code": "# Создай класс Hero\n",
        "test_cases": [
            {"id": "tc_class", "type": "code_regex", "value": "class\\s+Hero", "flags": "m", "label": "Есть класс Hero", "points": 1},
            {"id": "tc_init", "type": "code_regex", "value": "def\\s+__init__", "flags": "m", "label": "Есть __init__", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "В __init__ используй self.name и self.hp",
            "Создай объект hero = Hero('Arman', 100)",
        ],
    },
    {
        "id": "g15-m2",
        "title": "Методы класса",
        "chapter": "Глава 15",
        "description": "Добавь метод attack() и метод is_alive() для класса Hero.",
        "difficulty": "Сложный",
        "xp_reward": 80,
        "objectives": [
            {"id": 1, "text": "Добавьте метод attack", "testCaseId": "tc_attack", "completed": False},
            {"id": 2, "text": "Добавьте метод is_alive", "testCaseId": "tc_alive", "completed": False},
        ],
        "starter_code": "class Hero:\n    pass\n",
        "test_cases": [
            {"id": "tc_attack", "type": "code_regex", "value": "def\\s+attack", "flags": "m", "label": "Есть attack", "points": 1},
            {"id": "tc_alive", "type": "code_regex", "value": "def\\s+is_alive", "flags": "m", "label": "Есть is_alive", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "attack может уменьшать hp цели",
            "is_alive возвращает self.hp > 0",
        ],
    },
    {
        "id": "g16-m1",
        "title": "Запрос к API",
        "chapter": "Глава 16",
        "description": "Сделай GET-запрос к API и выведи статус и часть ответа.",
        "difficulty": "Сложный",
        "xp_reward": 85,
        "objectives": [
            {"id": 1, "text": "Сделайте HTTP запрос", "testCaseId": "tc_request", "completed": False},
            {"id": 2, "text": "Выведите данные", "testCaseId": "tc_print", "completed": False},
        ],
        "starter_code": "# Запрос к API\n",
        "test_cases": [
            {"id": "tc_request", "type": "code_regex", "value": "requests\\.get|urllib\\.request", "flags": "m", "label": "Есть HTTP-запрос", "points": 1},
            {"id": "tc_print", "type": "code_regex", "value": "print\\s*\\(", "flags": "m", "label": "Есть вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Можно использовать requests.get(url)",
            "Выведи status_code и часть json",
        ],
    },
    {
        "id": "g16-m2",
        "title": "Финальный интеграционный проект",
        "chapter": "Глава 16",
        "description": "Собери проект: загрузка данных API, сохранение в файл и обработка через класс.",
        "difficulty": "Сложный",
        "xp_reward": 100,
        "objectives": [
            {"id": 1, "text": "Загрузите данные API", "testCaseId": "tc_api", "completed": False},
            {"id": 2, "text": "Сохраните данные в файл", "testCaseId": "tc_file", "completed": False},
            {"id": 3, "text": "Используйте класс для обработки", "testCaseId": "tc_class", "completed": False},
        ],
        "starter_code": "# Финальный проект: API + файл + класс\n",
        "test_cases": [
            {"id": "tc_api", "type": "code_regex", "value": "requests\\.get|urllib\\.request", "flags": "m", "label": "Есть API-запрос", "points": 1},
            {"id": "tc_file", "type": "code_regex", "value": "open\\s*\\(.*['\"]w['\"]", "flags": "m", "label": "Есть запись в файл", "points": 1},
            {"id": "tc_class", "type": "code_regex", "value": "class\\s+", "flags": "m", "label": "Есть класс", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Разбей проект на этапы: fetch -> save -> parse",
            "Используй отдельный класс-обработчик данных",
        ],
    },
    {
        "id": "g17-m1",
        "title": "Тренажер условий",
        "chapter": "Глава 17",
        "description": "Напиши программу, которая по баллу выводит оценку: отлично, хорошо или нужно подтянуть.",
        "difficulty": "Лёгкий",
        "xp_reward": 55,
        "objectives": [
            {"id": 1, "text": "Используйте if/elif/else", "testCaseId": "tc_if", "completed": False},
            {"id": 2, "text": "Выведите результат", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "score = 78\n# Выведи текстовую оценку\n",
        "test_cases": [
            {"id": "tc_if", "type": "code_regex", "value": "\\bif\\b.*\\belif\\b|\\bif\\b.*\\belse\\b", "flags": "ms", "label": "Есть ветвление", "points": 1},
            {"id": "tc_output", "type": "code_regex", "value": "print\\s*\\(", "flags": "m", "label": "Есть вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Используй пороги баллов, например 85 и 70",
            "Сначала определи текст в переменной, потом сделай print",
        ],
    },
    {
        "id": "g17-m2",
        "title": "Циклический калькулятор суммы",
        "chapter": "Глава 17",
        "description": "Посчитай сумму чисел от 1 до n с помощью цикла for.",
        "difficulty": "Лёгкий",
        "xp_reward": 60,
        "objectives": [
            {"id": 1, "text": "Используйте цикл for", "testCaseId": "tc_for", "completed": False},
            {"id": 2, "text": "Найдите сумму", "testCaseId": "tc_sum", "completed": False},
        ],
        "starter_code": "n = 10\n# Найди сумму от 1 до n\n",
        "test_cases": [
            {"id": "tc_for", "type": "code_regex", "value": "\\bfor\\b", "flags": "m", "label": "Есть цикл", "points": 1},
            {"id": "tc_sum", "type": "code_regex", "value": "total|sum", "flags": "m", "label": "Есть переменная суммы", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Создай total = 0 и добавляй числа в цикле",
            "Диапазон: range(1, n + 1)",
        ],
    },
    {
        "id": "g18-m1",
        "title": "Функция среднего значения",
        "chapter": "Глава 18",
        "description": "Создай функцию average(nums), которая возвращает среднее значение списка.",
        "difficulty": "Средний",
        "xp_reward": 65,
        "objectives": [
            {"id": 1, "text": "Создайте функцию average", "testCaseId": "tc_func", "completed": False},
            {"id": 2, "text": "Верните результат", "testCaseId": "tc_return", "completed": False},
        ],
        "starter_code": "nums = [5, 7, 9, 11]\n# Напиши функцию average(nums)\n",
        "test_cases": [
            {"id": "tc_func", "type": "code_regex", "value": "def\\s+average\\s*\\(", "flags": "m", "label": "Есть функция average", "points": 1},
            {"id": "tc_return", "type": "code_regex", "value": "\\breturn\\b", "flags": "m", "label": "Есть return", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Среднее: sum(nums) / len(nums)",
            "Проверь, что список не пустой",
        ],
    },
    {
        "id": "g18-m2",
        "title": "Мини-проект 8/9: анализ успеваемости",
        "chapter": "Глава 18",
        "description": "Собери мини-проект: список оценок, функция подсчета среднего и вывод статуса ученика.",
        "difficulty": "Средний",
        "xp_reward": 75,
        "objectives": [
            {"id": 1, "text": "Используйте список", "testCaseId": "tc_list", "completed": False},
            {"id": 2, "text": "Создайте функцию", "testCaseId": "tc_func", "completed": False},
            {"id": 3, "text": "Сделайте итоговый вывод", "testCaseId": "tc_output", "completed": False},
        ],
        "starter_code": "grades = [4, 5, 3, 5, 4]\n# Мини-проект: рассчитай средний балл и выведи статус\n",
        "test_cases": [
            {"id": "tc_list", "type": "code_regex", "value": "\\[[^\\]]+\\]", "flags": "m", "label": "Есть список", "points": 1},
            {"id": "tc_func", "type": "code_regex", "value": "def\\s+", "flags": "m", "label": "Есть функция", "points": 1},
            {"id": "tc_output", "type": "code_regex", "value": "print\\s*\\(", "flags": "m", "label": "Есть вывод", "points": 1},
            {"id": "tc_runtime", "type": "returncode_equals", "value": 0, "label": "Код выполняется", "points": 1},
        ],
        "hints": [
            "Раздели решение на шаги: данные -> функция -> решение",
            "Для статуса можно использовать if/elif/else",
        ],
    },
]


DEFAULT_LEADERBOARD_ENTRIES = [
    {
        "id": 1,
        "rank": 1,
        "name": "PyPath Admin",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=PyPathAdmin",
        "xp": 99999,
        "level": 99,
        "badge": "Admin",
        "school": "PyPath",
        "scope": "global",
    },
    {
        "id": 2,
        "rank": 2,
        "name": "Aigerim K",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Aigerim",
        "xp": 18420,
        "level": 22,
        "badge": "Pro",
        "school": "Astana IT School",
        "scope": "global",
    },
    {
        "id": 3,
        "rank": 3,
        "name": "Arman S",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Arman",
        "xp": 17110,
        "level": 21,
        "badge": "Gold",
        "school": "Almaty Lyceum",
        "scope": "global",
    },
    {
        "id": 4,
        "rank": 4,
        "name": "Dina T",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dina",
        "xp": 15300,
        "level": 19,
        "badge": "Silver",
        "school": "Kokshetau School",
        "scope": "global",
    },
    {
        "id": 5,
        "rank": 5,
        "name": "Nurzhan M",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Nurzhan",
        "xp": 14150,
        "level": 18,
        "badge": "Silver",
        "school": "Shymkent STEM",
        "scope": "global",
    },
]


DEFAULT_ADMIN_ACTIVITY = [
    {"day": "Mon", "xp": 580},
    {"day": "Tue", "xp": 620},
    {"day": "Wed", "xp": 710},
    {"day": "Thu", "xp": 760},
    {"day": "Fri", "xp": 840},
    {"day": "Sat", "xp": 920},
    {"day": "Sun", "xp": 1010},
]


DEFAULT_ADMIN_SKILLS = [
    {"skill": "Логика", "value": 92},
    {"skill": "Синтаксис", "value": 95},
    {"skill": "Скорость", "value": 88},
    {"skill": "Внимательность", "value": 90},
    {"skill": "Креативность", "value": 86},
    {"skill": "Упорство", "value": 97},
]


def ensure_default_courses() -> None:
    from app.core.database import init_db
    init_db()
    from app.core.database import _get_session_factory
    db = _get_session_factory()()
    try:
        for course_data in DEFAULT_COURSES:
            content_bundle = build_course_content(
                int(course_data["id"]),
                str(course_data["title"]),
                str(course_data["description"]),
                int(course_data["total_lessons"]),
            )
            seeded_data = {**course_data, **content_bundle}
            existing = db.query(Course).filter(Course.id == course_data["id"]).first()
            if existing:
                existing.title = seeded_data["title"]
                existing.description = seeded_data["description"]
                existing.theory_content = seeded_data["theory_content"]
                existing.quiz_bank = seeded_data["quiz_bank"]
                existing.reward_preview = seeded_data["reward_preview"]
                existing.progress = seeded_data["progress"]
                existing.total_lessons = seeded_data["total_lessons"]
                existing.icon = seeded_data["icon"]
                existing.color = seeded_data["color"]
                existing.difficulty = seeded_data["difficulty"]
                existing.stars = seeded_data["stars"]
                existing.is_boss = seeded_data["is_boss"]
                existing.locked = seeded_data["locked"]
            else:
                db.add(Course(**seeded_data))

        db.commit()
    finally:
        db.close()


def ensure_default_missions() -> None:
    from app.core.database import init_db
    init_db()
    from app.core.database import _get_session_factory
    db = _get_session_factory()()
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


def ensure_default_leaderboard() -> None:
    from app.core.database import init_db
    from sqlalchemy import inspect

    init_db()
    engine = SessionLocal.kw.get("bind") if hasattr(SessionLocal, "kw") else None
    if engine is None:
        from app.core.database import _get_engine
        engine = _get_engine()

    inspector = inspect(engine)
    if "leaderboard" not in inspector.get_table_names():
        return

    db = SessionLocal()
    try:
        for entry_data in DEFAULT_LEADERBOARD_ENTRIES:
            existing = db.query(LeaderboardEntry).filter(LeaderboardEntry.id == entry_data["id"]).first()
            if existing:
                existing.rank = entry_data["rank"]
                existing.name = entry_data["name"]
                existing.avatar = entry_data["avatar"]
                existing.xp = entry_data["xp"]
                existing.level = entry_data["level"]
                existing.badge = entry_data["badge"]
                existing.school = entry_data["school"]
                existing.scope = entry_data["scope"]
            else:
                db.add(LeaderboardEntry(**entry_data))

        db.commit()
    finally:
        db.close()


def ensure_admin_account() -> None:
    settings = get_settings()
    admin_username = (getattr(settings, "admin_username", "") or "admin_pypath").strip()
    admin_email = (getattr(settings, "admin_email", "") or "admin@pypath.local").strip().lower()
    admin_password = getattr(settings, "admin_password", "") or "Admin12345!"
    admin_name = (getattr(settings, "admin_name", "") or "PyPath Admin").strip()

    from app.core.database import _get_session_factory
    db = _get_session_factory()()
    try:
        admin_user = db.query(User).filter(User.username == admin_username).first()
        if not admin_user and admin_email:
            admin_user = db.query(User).filter(User.email == admin_email).first()

        if admin_user:
            current_settings = admin_user.settings if isinstance(admin_user.settings, dict) else {}
            seed_mission_progress = {
                "g1-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                "g1-m2": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                "g2-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                "g2-m2": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                "g3-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                "g4-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
            }

            seed_course_progress = {
                "1": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                "2": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                "3": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                "4": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                "5": {"completedLessons": 1, "totalLessons": 1, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 2},
                "6": {"completedLessons": 1, "totalLessons": 1, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 2},
            }

            seed_attempts = {
                "g1-m1": {"totalAttempts": 2},
                "g1-m2": {"totalAttempts": 2},
                "g2-m1": {"totalAttempts": 3},
                "g2-m2": {"totalAttempts": 2},
                "g3-m1": {"totalAttempts": 3},
                "g4-m1": {"totalAttempts": 3},
            }

            admin_user.settings = {
                **current_settings,
                "role": "admin",
                "is_admin": True,
                "mission_progress": current_settings.get("mission_progress") if isinstance(current_settings.get("mission_progress"), dict) and current_settings.get("mission_progress") else seed_mission_progress,
                "course_progress": current_settings.get("course_progress") if isinstance(current_settings.get("course_progress"), dict) and current_settings.get("course_progress") else seed_course_progress,
                "mission_attempts": current_settings.get("mission_attempts") if isinstance(current_settings.get("mission_attempts"), dict) and current_settings.get("mission_attempts") else seed_attempts,
                "activity": current_settings.get("activity") if isinstance(current_settings.get("activity"), list) and current_settings.get("activity") else DEFAULT_ADMIN_ACTIVITY,
                "skills": current_settings.get("skills") if isinstance(current_settings.get("skills"), list) and current_settings.get("skills") else DEFAULT_ADMIN_SKILLS,
            }
            admin_user.full_name = admin_name
            admin_user.name = admin_name
            admin_user.streak = max(int(admin_user.streak or 0), 9)
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
                        "mission_progress": {
                            "g1-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                            "g1-m2": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                            "g2-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                            "g2-m2": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                            "g3-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                            "g4-m1": {"completed": True, "objectives": [{"id": 1, "text": "База", "completed": True}], "updatedAt": datetime.utcnow().isoformat()},
                        },
                        "course_progress": {
                            "1": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                            "2": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                            "3": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                            "4": {"completedLessons": 2, "totalLessons": 2, "progress": 100, "stars": 3, "completed": True, "unlocked": True, "season": 1},
                        },
                        "mission_attempts": {
                            "g1-m1": {"totalAttempts": 2},
                            "g1-m2": {"totalAttempts": 2},
                            "g2-m1": {"totalAttempts": 3},
                            "g2-m2": {"totalAttempts": 2},
                            "g3-m1": {"totalAttempts": 3},
                            "g4-m1": {"totalAttempts": 3},
                        },
                        "activity": DEFAULT_ADMIN_ACTIVITY,
                        "skills": DEFAULT_ADMIN_SKILLS,
                    },
                )
            )

        db.commit()
    finally:
        db.close()
