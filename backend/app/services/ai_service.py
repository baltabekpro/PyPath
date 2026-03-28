"""AI service for Google Gemini integration"""
import re
from typing import List, Dict, Optional
from datetime import datetime
import google.generativeai as genai
from app.core.config import get_settings


# ---------------------------------------------------------------------------
# Language helpers
# ---------------------------------------------------------------------------

# Characters that are unique to Kazakh (not present in Russian/English)
_KZ_UNIQUE_CHARS = re.compile(r"[әіңғүұқөһ]", re.IGNORECASE)


def detect_language(text: str) -> str:
    """Return 'kz' if the text appears to be Kazakh, else 'ru'."""
    if _KZ_UNIQUE_CHARS.search(text):
        return "kz"
    return "ru"


def _language_instruction(language: str) -> str:
    """Return a strict language instruction string for the given language code."""
    if language == "kz":
        return (
            "МАҢЫЗДЫ: Бұл хабарламаға ТЕК ҚАЗАҚ тілінде жауап бер. "
            "Орысша немесе ағылшынша сөздер қоспа. "
            "Барлық жауап қазақ тілінде болуы МІНДЕТТІ."
        )
    return (
        "ВАЖНО: Отвечай СТРОГО на русском языке. "
        "Не используй казахский или английский язык в ответе."
    )


# ---------------------------------------------------------------------------
# AIService
# ---------------------------------------------------------------------------

class AIService:
    """Service for AI chat using Google Gemini"""

    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.google_api_key)

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=1024,
            temperature=0.7,
            top_p=0.95,
            top_k=40,
        )

        self.model = genai.GenerativeModel(
            settings.gemini_model,
            generation_config=generation_config,
        )
        self.chat_sessions: Dict[str, genai.ChatSession] = {}
        self.message_history: Dict[str, List[Dict[str, str]]] = {}

        # Base system prompt (language-neutral preamble)
        self._base_system_prompt = """Ты - Оракул Кода, AI ассистент образовательной платформы PyPath для изучения Python.

Твоя роль:
- Помогать студентам понимать концепции программирования на Python
- Объяснять ошибки в коде простым языком
- Давать подсказки, не раскрывая полного решения
- Мотивировать и поддерживать процесс обучения

Стиль общения:
- Дружелюбный и поддерживающий
- Используй аналогии и примеры из реальной жизни
- Разбивай сложные концепции на простые шаги
- Поощряй самостоятельное мышление

Когда студент просит помощь с кодом:
1. Сначала спроси, что он уже пробовал
2. Укажи на ошибку, но не давай готовое решение
3. Дай подсказку о том, в каком направлении думать
4. Похвали за попытки и прогресс

Ограничения:
- Не пиши весь код за студента
- Не решай задачи полностью
- Фокусируйся на обучении, а не на готовых ответах"""

        # Deprecated: this alias exposes the language-neutral base prompt only.
        # Callers should use the language-aware methods (chat, analyze_code_execution, etc.)
        # instead of reading this attribute directly.
        self.system_prompt = self._base_system_prompt

    def _build_system_prompt(self, language: str) -> str:
        """Build a language-enforced system prompt."""
        lang_instruction = _language_instruction(language)
        return f"{self._base_system_prompt}\n\n{lang_instruction}"

    def _session_key_with_lang(self, user_id: str, language: str) -> str:
        """Session keys are per user+language so the language constraint persists."""
        return f"{user_id}::{language}"

    def get_or_create_session(self, user_id: str, language: str = "ru") -> genai.ChatSession:
        """Get existing chat session or create new one, scoped to the given language."""
        key = self._session_key_with_lang(user_id, language)
        if key not in self.chat_sessions:
            system_prompt = self._build_system_prompt(language)
            if language == "kz":
                greeting = "Түсіндім! Python оқуда студенттерге көмектесуге дайынмын. Бастайық! 🚀"
            else:
                greeting = "Понял! Я готов помогать студентам изучать Python. Буду объяснять концепции понятно, давать подсказки вместо готовых решений и мотивировать на обучение. Давай начнем! 🚀"
            self.chat_sessions[key] = self.model.start_chat(
                history=[
                    {"role": "user", "parts": [system_prompt]},
                    {"role": "model", "parts": [greeting]},
                ]
            )
        return self.chat_sessions[key]

    def chat(self, user_id: str, message: str, language: str | None = None) -> str:
        """Send message and get AI response.

        The response language is determined (in priority order) by:
        1. The explicit ``language`` parameter.
        2. Auto-detection from the user's ``message`` text.
        Defaults to ``"ru"`` when neither source provides a clear signal.
        """
        # Determine effective language
        if not language:
            language = detect_language(message)
        language = language if language in ("kz", "ru") else "ru"

        try:
            session = self.get_or_create_session(user_id, language)
            self.message_history.setdefault(user_id, []).append({
                "id": f"{int(datetime.now().timestamp() * 1000)}_u",
                "sender": "user",
                "text": message,
                "timestamp": datetime.now().isoformat(),
            })
            # Prepend a per-message language reminder so the model cannot drift
            lang_reminder = _language_instruction(language)
            augmented = f"{lang_reminder}\n\n{message}"
            response = session.send_message(augmented)
            self.message_history.setdefault(user_id, []).append({
                "id": f"{int(datetime.now().timestamp() * 1000)}_a",
                "sender": "ai",
                "text": response.text,
                "timestamp": datetime.now().isoformat(),
            })
            return response.text
        except Exception:
            if language == "kz":
                return "Кешіріңіз, AI қазір қолжетімді емес. Кейінірек қайталаңыз."
            return "Извини, AI сейчас временно недоступен. Попробуй ещё раз чуть позже."

    def reset_session(self, user_id: str) -> None:
        """Reset all chat sessions for a user."""
        for key in list(self.chat_sessions.keys()):
            if key.startswith(f"{user_id}::") or key == user_id:
                del self.chat_sessions[key]
        self.message_history[user_id] = []

    def get_history(self, user_id: str) -> List[Dict[str, str]]:
        """Get stored chat history for user"""
        return self.message_history.get(user_id, [])

    def get_quick_response(self, query_type: str, language: str = "ru") -> str:
        """Get predefined quick responses in the requested language."""
        if language == "kz":
            responses = {
                "hint": "Бірге ойлайық! Тапсырманың қай бөлігін түсіндің? Кішкентайдан бастап қадамдап жүр. 💡",
                "error": "Қателер — бұл қалыпты! Олар бізді үйретеді. Кодты көрсет, не дұрыс емесін анықтауға көмектесемін. 🔍",
                "theory": "Керемет сұрақ! Теория 'неліктен' деген сұраққа жауап береді. Қай тұжырымдаманы үйренгің келеді? 📚",
                "motivation": "Дұрыс жолдасың! Кодтың әр жолы шеберлікке жақындатады. Жалғастыр! 🌟",
            }
            return responses.get(query_type, "Қалай көмектесе аламын? Сұра! 😊")
        responses = {
            "hint": "Давай подумаем вместе! Какую часть задачи ты уже понял? Начни с малого и двигайся пошагово. 💡",
            "error": "Ошибки - это нормально! Они учат нас. Покажи мне код, и я помогу разобраться, что пошло не так. 🔍",
            "theory": "Отличный вопрос! Теория помогает понять 'почему'. Скажи, какую концепцию хочешь изучить? 📚",
            "motivation": "Ты на правильном пути! Каждая строка кода приближает тебя к мастерству. Продолжай! 🌟",
        }
        return responses.get(query_type, "Чем могу помочь? Спрашивай! 😊")

    def analyze_code_execution(
        self,
        code: str,
        stdout: str,
        stderr: str,
        objectives: list,
        language: str = "ru",
    ) -> str:
        """Analyze code + terminal output and provide actionable feedback."""
        lang_instruction = _language_instruction(language)
        if language == "kz":
            prompt = f"""{lang_instruction}

Сен Python менторы ретінде жауап бересің.

Пайдаланушы коды:
```python
{code}
```

Терминал шығысы:
{stdout or '<бос>'}

Терминал қателері:
{stderr or '<жоқ>'}

Тапсырма мақсаттары:
{objectives}

Қысқа талдау жаса:
1) Не дұрыс жасалды
2) Қандай қателер/олқылықтар бар
3) Келесі қадамда не түзету керек

Толық шешім жазба. Қысқа және нақты бол."""
        else:
            prompt = f"""{lang_instruction}

Ты выступаешь как ментор Python.

Код пользователя:
```python
{code}
```

Вывод терминала:
{stdout or '<пусто>'}

Ошибки терминала:
{stderr or '<нет>'}

Цели задания:
{objectives}

Сформируй короткий разбор на русском:
1) Что сделано правильно
2) Какие ошибки/пробелы
3) Что исправить следующим шагом

Не пиши полное готовое решение. Будь кратким и практичным."""

        try:
            response = self.model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text
        except Exception:
            pass

        if language == "kz":
            if stderr:
                return "Кодта орындау қатесі бар. Қате мәтінін тексеріп, синтаксис немесе шегіністерді түзетіп, қайта іске қос."
            if stdout:
                return "Код іске қосылып, терминалға бірдеңе шығарады. Шығысты күтілетінмен салыстыр."
            return "Код іске қосылады, бірақ пайдалы шығыс жоқ. print қос және тапсырма мақсаттарын тексер."
        if stderr:
            return "В коде есть ошибка выполнения. Проверь текст ошибки в терминале, затем исправь синтаксис или отступы и запусти снова."
        if stdout:
            return "Код выполняется и что-то выводит в терминал. Сравни вывод с ожидаемым и добейся полного совпадения по целям задания."
        return "Код запускается, но пока не видно полезного вывода. Добавь проверочный print и пройдись по всем целями миссии."

    def generate_quiz_questions(
        self,
        topic: str,
        theory_content: str,
        language: str = "ru",
        num_questions: int = 3,
    ) -> list[dict]:
        """Generate quiz questions to reinforce a learning topic.

        Returns a list of question dicts with keys:
        ``question``, ``options`` (list of 4 strings), ``correct_index`` (0-based int),
        ``explanation``.
        """
        lang_instruction = _language_instruction(language)
        if language == "kz":
            prompt = f"""{lang_instruction}

Сен PyPath платформасының Python оқу ассистентісің.

Тақырып: {topic}

Теориялық мазмұн:
{theory_content}

Осы теорияны түсінуді тексеру үшін {num_questions} тест сұрағын жаса.
Әр сұрақ төмендегі JSON форматында болуы керек:

[
  {{
    "question": "Сұрақ мәтіні",
    "options": ["А жауап", "Б жауап", "В жауап", "Г жауап"],
    "correct_index": 0,
    "explanation": "Неліктен бұл жауап дұрыс екенін түсіндір"
  }}
]

Тек JSON массивін қайтар, қосымша мәтінсіз."""
        else:
            prompt = f"""{lang_instruction}

Ты — ассистент образовательной платформы PyPath по изучению Python.

Тема: {topic}

Теоретический материал:
{theory_content}

Создай {num_questions} тестовых вопроса для проверки понимания этой теории.
Каждый вопрос должен быть в следующем JSON формате:

[
  {{
    "question": "Текст вопроса",
    "options": ["Вариант А", "Вариант Б", "Вариант В", "Вариант Г"],
    "correct_index": 0,
    "explanation": "Объясни, почему этот ответ правильный"
  }}
]

Верни только JSON массив без дополнительного текста."""

        try:
            response = self.model.generate_content(prompt)
            text = (response.text or "").strip()
            # Strip possible markdown code fences
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            import json
            questions = json.loads(text)
            if isinstance(questions, list):
                return questions[:num_questions]
        except Exception:
            pass

        # Fallback: return a static example so the UI always gets data
        if language == "kz":
            return [
                {
                    "question": f"{topic} тақырыбы бойынша: Python-да print() функциясы не істейді?",
                    "options": [
                        "Мәтінді экранға шығарады",
                        "Айнымалыны жояды",
                        "Санды қосады",
                        "Бағдарламаны тоқтатады",
                    ],
                    "correct_index": 0,
                    "explanation": "print() функциясы мәліметтерді консольге (экранға) шығарады.",
                }
            ]
        return [
            {
                "question": f"По теме '{topic}': что делает функция print() в Python?",
                "options": [
                    "Выводит текст на экран",
                    "Удаляет переменную",
                    "Складывает числа",
                    "Останавливает программу",
                ],
                "correct_index": 0,
                "explanation": "Функция print() выводит данные в консоль (на экран).",
            }
        ]


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get AI service singleton"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
