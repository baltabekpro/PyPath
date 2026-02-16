"""AI service for Google Gemini integration"""
from typing import List, Dict, Optional
from datetime import datetime
import google.generativeai as genai
from app.core.config import get_settings


class AIService:
    """Service for AI chat using Google Gemini"""
    
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.google_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
        self.chat_sessions: Dict[str, genai.ChatSession] = {}
        self.message_history: Dict[str, List[Dict[str, str]]] = {}
        
        # System prompt for PyPath AI assistant
        self.system_prompt = """Ты - Оракул Кода, AI ассистент образовательной платформы PyPath для изучения Python.

Твоя роль:
- Помогать студентам понимать концепции программирования на Python
- Объяснять ошибки в коде простым языком
- Давать подсказки, не раскрывая полного решения
- Мотивировать и поддерживать процесс обучения
- Отвечать на русском языке, используя термины программирования

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
- Фокусируйся на обучении, а не на готовых ответах

Помни: цель - научить думать как программист, а не просто дать ответ."""

    def get_or_create_session(self, user_id: str) -> genai.ChatSession:
        """Get existing chat session or create new one"""
        if user_id not in self.chat_sessions:
            self.chat_sessions[user_id] = self.model.start_chat(
                history=[
                    {
                        "role": "user",
                        "parts": [self.system_prompt]
                    },
                    {
                        "role": "model",
                        "parts": ["Понял! Я готов помогать студентам изучать Python. Буду объяснять концепции понятно, давать подсказки вместо готовых решений и мотивировать на обучение. Давай начнем! 🚀"]
                    }
                ]
            )
        return self.chat_sessions[user_id]
    
    def chat(self, user_id: str, message: str) -> str:
        """Send message and get AI response"""
        try:
            session = self.get_or_create_session(user_id)
            self.message_history.setdefault(user_id, []).append({
                "id": f"{int(datetime.now().timestamp() * 1000)}_u",
                "sender": "user",
                "text": message,
                "timestamp": datetime.now().isoformat(),
            })
            response = session.send_message(message)
            self.message_history.setdefault(user_id, []).append({
                "id": f"{int(datetime.now().timestamp() * 1000)}_a",
                "sender": "ai",
                "text": response.text,
                "timestamp": datetime.now().isoformat(),
            })
            return response.text
        except Exception as e:
            return f"Извини, произошла ошибка при обработке запроса: {str(e)}"
    
    def reset_session(self, user_id: str) -> None:
        """Reset chat session for user"""
        if user_id in self.chat_sessions:
            del self.chat_sessions[user_id]
        self.message_history[user_id] = []

    def get_history(self, user_id: str) -> List[Dict[str, str]]:
        """Get stored chat history for user"""
        return self.message_history.get(user_id, [])
    
    def get_quick_response(self, query_type: str) -> str:
        """Get predefined quick responses"""
        responses = {
            "hint": "Давай подумаем вместе! Какую часть задачи ты уже понял? Начни с малого и двигайся пошагово. 💡",
            "error": "Ошибки - это нормально! Они учат нас. Покажи мне код, и я помогу разобраться, что пошло не так. 🔍",
            "theory": "Отличный вопрос! Теория помогает понять 'почему'. Скажи, какую концепцию хочешь изучить? 📚",
            "motivation": "Ты на правильном пути! Каждая строка кода приближает тебя к мастерству. Продолжай! 🌟"
        }
        return responses.get(query_type, "Чем могу помочь? Спрашивай! 😊")

    def analyze_code_execution(self, code: str, stdout: str, stderr: str, objectives: list) -> str:
        """Analyze code + terminal output and provide actionable feedback"""
        prompt = f"""
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

Не пиши полное готовое решение. Будь кратким и практичным.
"""
        try:
            response = self.model.generate_content(prompt)
            text = (response.text or "").strip()
            if text:
                return text
        except Exception:
            pass

        if stderr:
            return "В коде есть ошибка выполнения. Проверь текст ошибки в терминале, затем исправь синтаксис или отступы и запусти снова."
        if stdout:
            return "Код выполняется и что-то выводит в терминал. Сравни вывод с ожидаемым и добейся полного совпадения по целям задания."
        return "Код запускается, но пока не видно полезного вывода. Добавь проверочный print и пройдись по всем целям миссии."


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get AI service singleton"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
