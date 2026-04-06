"""AI service for OpenRouter chat completions."""
import json
import logging
import re
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass
import httpx
from app.core.config import get_settings
from .scaffolding_engine import ScaffoldingEngine, RequestType
from .response_validator import ResponseValidator, ValidationResult
from .validation_logger import ValidationLogger


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Language helpers
# ---------------------------------------------------------------------------

# Characters that are unique to Kazakh (not present in Russian/English)
# All 9 Kazakh extended characters: ә, і, ң, ғ, ү, ұ, қ, ө, һ
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
            "ӨТЕ МАҢЫЗДЫ - ТІЛ ТАЛАПТАРЫ:\n"
            "1. Бұл хабарламаға ТЕК ҚАНА ҚАЗАҚ тілінде жауап бер\n"
            "2. Орысша, ағылшынша немесе басқа тілдердің сөздерін МҮЛДЕМ қоспа\n"
            "3. Барлық түсіндірулер, мысалдар және кеңестер ТҰТАС қазақ тілінде болуы МІНДЕТТІ\n"
            "4. Код блоктарынан тыс ЕШҚАНДАЙ орыс немесе ағылшын сөздері болмауы керек\n"
            "5. Егер қазақша термин білмесең, қазақша сипаттап бер, бірақ басқа тілге ауыспа\n"
            "ЕСКЕРТУ: Аралас тілді қолдану ҚАТАҢ ТЫЙЫМ САЛЫНҒАН!"
        )
    return (
        "КРИТИЧЕСКИ ВАЖНО - ЯЗЫКОВЫЕ ТРЕБОВАНИЯ:\n"
        "1. Отвечай ИСКЛЮЧИТЕЛЬНО на русском языке\n"
        "2. НЕ используй казахские, английские или другие иностранные слова ВООБЩЕ\n"
        "3. Все объяснения, примеры и советы должны быть ПОЛНОСТЬЮ на русском языке\n"
        "4. Вне блоков кода НЕ ДОЛЖНО быть казахских или английских слов\n"
        "5. Если не знаешь русский термин, опиши его по-русски, но не переходи на другой язык\n"
        "ПРЕДУПРЕЖДЕНИЕ: Смешивание языков СТРОГО ЗАПРЕЩЕНО!"
    )


# ---------------------------------------------------------------------------
# Data models for scaffolding
# ---------------------------------------------------------------------------

@dataclass
class ScaffoldedResponse:
    """Response with scaffolding validation metadata."""
    response: str
    timestamp: str
    scaffolding_applied: bool
    request_type: RequestType
    validation_result: ValidationResult
    rules_applied: list[str]


@dataclass
class ScaffoldingStatus:
    """Current scaffolding configuration status."""
    enabled: bool
    rules: list[dict]
    system_prompt_preview: str


# ---------------------------------------------------------------------------
# AIService
# ---------------------------------------------------------------------------

class AIService:
    """Service for AI chat using OpenRouter."""

    _MAX_CONTINUATION_ATTEMPTS = 2

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.openrouter_api_key.strip()
        self.model_name = settings.openrouter_model.strip() or "stepfun/step-3.5-flash:free"
        self.referer = settings.openrouter_referer.strip() or "https://py-path.vercel.app"
        self.title = settings.openrouter_title.strip() or "PyPath"
        self.client = httpx.Client(
            base_url="https://openrouter.ai/api/v1",
            timeout=httpx.Timeout(60.0, connect=10.0),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "HTTP-Referer": self.referer,
                "X-Title": self.title,
                "Content-Type": "application/json",
            },
        )
        self.message_history: Dict[str, List[Dict[str, str]]] = {}

        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY is not configured. AI routes will return fallback responses.")

        # Initialize scaffolding components
        self.scaffolding_engine = ScaffoldingEngine()
        self.response_validator = ResponseValidator()
        self.validation_logger = ValidationLogger()

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

    @staticmethod
    def _extract_text_from_choice(choice: dict) -> str:
        message = choice.get("message") or {}
        content = message.get("content", "")
        if isinstance(content, list):
            chunks: list[str] = []
            for part in content:
                if isinstance(part, dict):
                    chunks.append(str(part.get("text") or ""))
                else:
                    chunks.append(str(part))
            content = "".join(chunks)
        return str(content or "").strip()

    @staticmethod
    def _finish_reason(choice: dict) -> str:
        return str(choice.get("finish_reason") or "").strip().lower()

    def _call_openrouter(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float,
        max_tokens: int,
    ) -> tuple[str, str]:
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        response = self.client.post("/chat/completions", json=payload)
        response.raise_for_status()
        data = response.json()
        choices = data.get("choices") or []
        if not choices:
            return "", ""

        choice = choices[0] if isinstance(choices[0], dict) else {}
        return self._extract_text_from_choice(choice), self._finish_reason(choice)

    def _build_conversation_messages(
        self,
        session_key: str,
        user_message: str,
        language: str,
        context: Optional[dict] = None,
    ) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = [
            {"role": "system", "content": self._build_system_prompt(language)},
        ]

        for item in self.message_history.get(session_key, [])[-20:]:
            sender = item.get("sender")
            text = str(item.get("text") or "").strip()
            if sender not in {"user", "ai"} or not text:
                continue
            messages.append({
                "role": "user" if sender == "user" else "assistant",
                "content": text,
            })

        content = user_message.strip()
        if isinstance(context, dict) and context:
            try:
                content = f"{content}\n\nКонтекст экрана обучения:\n{json.dumps(context, ensure_ascii=False, indent=2)}"
            except Exception:
                pass

        messages.append({"role": "user", "content": content})
        return messages

    def _append_history_message(self, session_key: str, sender: str, text: str) -> None:
        if not text.strip():
            return
        self.message_history.setdefault(session_key, []).append({
            "id": f"{int(datetime.now().timestamp() * 1000)}_{'u' if sender == 'user' else 'a'}",
            "sender": sender,
            "text": text,
            "timestamp": datetime.now().isoformat(),
        })

    def _complete_chat(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float,
        max_tokens: int,
        language: str,
    ) -> str:
        parts: list[str] = []
        current_messages = list(messages)
        continuation_prompt = (
            "Продолжи предыдущий ответ с того места, где он оборвался. "
            "Не повторяй уже сказанное. Сохраняй тот же язык и стиль."
            if language == "ru"
            else "Алдыңғы жауап үзілген жерден жалғастыр. "
            "Айтылғанды қайталама. Сол тіл мен стильді сақта."
        )

        attempts = 0
        while attempts <= self._MAX_CONTINUATION_ATTEMPTS:
            text, finish_reason = self._call_openrouter(current_messages, temperature=temperature, max_tokens=max_tokens)
            if text:
                parts.append(text)

            if finish_reason not in {"length", "max_tokens"}:
                break

            attempts += 1
            if attempts > self._MAX_CONTINUATION_ATTEMPTS:
                break

            current_messages = current_messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": continuation_prompt},
            ]

        return " ".join(part.strip() for part in parts if part.strip()).strip()

    def _fallback_message(self, language: str, quota: bool = False) -> str:
        if quota:
            if language == "kz":
                return "AI қазір сұраныстар шегіне жетті. Бірнеше минуттан кейін қайта көріңіз."
            return "AI сейчас временно недоступен из-за лимита запросов. Попробуй снова через несколько минут."
        if language == "kz":
            return "Кешіріңіз, AI қазір қолжетімді емес. Кейінірек қайталаңыз."
        return "Извини, AI сейчас временно недоступен. Попробуй ещё раз чуть позже."

    def _openrouter_stream(
        self,
        messages: list[dict[str, str]],
        *,
        temperature: float,
        max_tokens: int,
    ) -> tuple[object, dict[str, str]]:
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        state = {"finish_reason": ""}

        def iterator():
            with self.client.stream("POST", "/chat/completions", json=payload) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if not line:
                        continue
                    if line.startswith("data:"):
                        data_text = line[5:].strip()
                        if data_text == "[DONE]":
                            break
                        try:
                            data = json.loads(data_text)
                        except Exception:
                            continue
                        choices = data.get("choices") or []
                        if not choices:
                            continue
                        choice = choices[0] if isinstance(choices[0], dict) else {}
                        state["finish_reason"] = self._finish_reason(choice) or state["finish_reason"]
                        delta = choice.get("delta") or {}
                        content = delta.get("content")
                        if content:
                            yield str(content)

        return iterator(), state

    def chat(self, user_id: str, message: str, language: str | None = None, context: Optional[dict] = None) -> str:
        """Send message and get AI response.

        The response language is determined (in priority order) by:
        1. The explicit ``language`` parameter.
        2. Auto-detection from the user's ``message`` text.
        Defaults to ``"ru"`` when neither source provides a clear signal.
        """
        if not language:
            language = detect_language(message)
        language = language if language in ("kz", "ru") else "ru"

        session_key = user_id

        try:
            messages = self._build_conversation_messages(session_key, message, language, context)
            response_text = self._complete_chat(messages, temperature=0.7, max_tokens=2048, language=language)
            if not response_text:
                raise RuntimeError("Empty response from OpenRouter")

            self._append_history_message(session_key, "user", message)
            self._append_history_message(session_key, "ai", response_text)
            return response_text
        except httpx.HTTPStatusError as exc:
            logger.warning("OpenRouter request failed for user_id=%s language=%s: %s", user_id, language, exc)
            if exc.response.status_code == 429:
                return self._fallback_message(language, quota=True)
            return self._fallback_message(language)
        except Exception:
            logger.exception("AI chat failed for user_id=%s language=%s", user_id, language)
            return self._fallback_message(language)

    def chat_with_scaffolding(
        self,
        user_id: str,
        message: str,
        language: str | None = None,
        context: Optional[dict] = None
    ) -> ScaffoldedResponse:
        """Send message and get AI response with scaffolding validation.
        
        This method integrates the scaffolding engine to build mentor-mode system prompts,
        validates responses to ensure they don't contain complete solutions, and logs
        all interactions for verification.
        
        Args:
            user_id: The user's unique identifier
            message: The user's message text
            language: Optional language code ('kz' or 'ru'), auto-detected if not provided
            context: Optional context dictionary with additional information
            
        Returns:
            ScaffoldedResponse with validation metadata
        """
        # Detect language if not provided
        if not language:
            language = detect_language(message)
        language = language if language in ("kz", "ru") else "ru"
        
        # Classify request type
        request_type = self.scaffolding_engine.classify_request_type(message)
        
        # Get active scaffolding rules
        active_rules = self.scaffolding_engine.get_scaffolding_rules()
        
        session_key = user_id
        
        try:
            # Build scaffolding-enhanced system prompt
            scaffolding_prompt = self.scaffolding_engine.build_mentor_prompt(language, context)
            
            # Build conversation messages with scaffolding prompt
            messages: list[dict[str, str]] = [
                {"role": "system", "content": scaffolding_prompt},
            ]
            
            # Add conversation history
            for item in self.message_history.get(session_key, [])[-20:]:
                sender = item.get("sender")
                text = str(item.get("text") or "").strip()
                if sender not in {"user", "ai"} or not text:
                    continue
                messages.append({
                    "role": "user" if sender == "user" else "assistant",
                    "content": text,
                })
            
            # Add current user message
            content = message.strip()
            if isinstance(context, dict) and context:
                try:
                    content = f"{content}\n\nКонтекст экрана обучения:\n{json.dumps(context, ensure_ascii=False, indent=2)}"
                except Exception:
                    pass
            
            messages.append({"role": "user", "content": content})
            
            # Get AI response
            original_response = self._complete_chat(messages, temperature=0.7, max_tokens=2048, language=language)
            if not original_response:
                raise RuntimeError("Empty response from OpenRouter")
            
            # Validate response against scaffolding rules
            validation_result = self.response_validator.validate_response(
                original_response,
                request_type,
                active_rules
            )
            
            # Log interaction
            self.validation_logger.log_interaction(
                user_id=user_id,
                request_type=request_type,
                validation_result=validation_result,
                rules_applied=validation_result.rules_applied
            )
            
            # Determine final response text
            if not validation_result.passed:
                logger.warning(
                    "Scaffolding validation failed for user_id=%s: rules_violated=%s",
                    user_id,
                    validation_result.rules_violated
                )
                response_text = self._get_fallback_hint(language, request_type)
            else:
                response_text = original_response
            
            # Update conversation history
            self._append_history_message(session_key, "user", message)
            self._append_history_message(session_key, "ai", response_text)
            
            # Return scaffolded response
            return ScaffoldedResponse(
                response=response_text,
                timestamp=datetime.now().isoformat(),
                scaffolding_applied=True,
                request_type=request_type,
                validation_result=validation_result,
                rules_applied=validation_result.rules_applied
            )
            
        except httpx.HTTPStatusError as exc:
            logger.warning("OpenRouter request failed for user_id=%s language=%s: %s", user_id, language, exc)
            fallback_text = self._fallback_message(language, quota=exc.response.status_code == 429)
            
            # Create minimal validation result for fallback
            validation_result = ValidationResult(
                passed=True,
                request_type=request_type,
                rules_applied=[],
                rules_violated=[],
                code_line_count=0,
                has_leading_question=False,
                is_complete_solution=False,
                confidence_score=0.0
            )
            
            return ScaffoldedResponse(
                response=fallback_text,
                timestamp=datetime.now().isoformat(),
                scaffolding_applied=False,
                request_type=request_type,
                validation_result=validation_result,
                rules_applied=[]
            )
        except Exception:
            logger.exception("AI chat with scaffolding failed for user_id=%s language=%s", user_id, language)
            fallback_text = self._fallback_message(language)
            
            # Create minimal validation result for fallback
            validation_result = ValidationResult(
                passed=True,
                request_type=request_type,
                rules_applied=[],
                rules_violated=[],
                code_line_count=0,
                has_leading_question=False,
                is_complete_solution=False,
                confidence_score=0.0
            )
            
            return ScaffoldedResponse(
                response=fallback_text,
                timestamp=datetime.now().isoformat(),
                scaffolding_applied=False,
                request_type=request_type,
                validation_result=validation_result,
                rules_applied=[]
            )

    def get_scaffolding_status(self) -> ScaffoldingStatus:
        """Get current scaffolding configuration status.
        
        Returns:
            ScaffoldingStatus with current configuration
        """
        # Get active rules
        active_rules = self.scaffolding_engine.get_scaffolding_rules()
        
        # Convert rules to dictionaries
        rules_dict = [
            {
                "id": rule.id,
                "description": rule.description,
                "constraint_type": rule.constraint_type.value,
                "max_code_lines": rule.max_code_lines,
                "max_paragraph_count": rule.max_paragraph_count,
                "requires_question": rule.requires_question,
                "active": rule.active
            }
            for rule in active_rules
        ]
        
        # Get system prompt preview (Russian version)
        system_prompt_preview = self.scaffolding_engine.build_mentor_prompt("ru")
        
        return ScaffoldingStatus(
            enabled=True,
            rules=rules_dict,
            system_prompt_preview=system_prompt_preview
        )

    def _get_fallback_hint(self, language: str, request_type: RequestType) -> str:
        """Get fallback hint when validation fails.
        
        Args:
            language: Language code ('kz' or 'ru')
            request_type: The type of request
            
        Returns:
            Fallback hint message
        """
        if language == "kz":
            hints = {
                RequestType.HINT: "Міне кеңес: тапсырманы кішкентай бөліктерге бөліп, әр бөлікті жеке шешіп көр. Қандай бөліктен бастағың келеді?",
                RequestType.SOLUTION: "Толық шешімді бере алмаймын, бірақ бағыт көрсете аламын. Алдымен не істеу керектігін ойлап көр. Қандай қадамдар қажет?",
                RequestType.EXPLANATION: "Бұл тұжырымдаманы түсіндірейін. Негізгі идея: [концепция]. Сен бұны қалай қолдануға болады деп ойлайсың?",
                RequestType.ERROR_HELP: "Қатені табу үшін кодты жолдап тексер. Қай жерде күтпеген нәтиже шығады? Не болуы керек еді?",
                RequestType.THEORY: "Бұл теорияны қарапайым сөзбен түсіндірейін. Негізгі принцип: [принцип]. Мысал келтіре аласың ба?",
                RequestType.MOTIVATION: "Сен дұрыс жолдасың! Қиындық - бұл өсудің белгісі. Қандай нақты сұрақтарың бар?"
            }
            return hints.get(request_type, "Қалай көмектесе аламын? Нақты сұрақ қой.")
        
        hints = {
            RequestType.HINT: "Вот подсказка: раздели задачу на маленькие части и реши каждую отдельно. С какой части хочешь начать?",
            RequestType.SOLUTION: "Не могу дать полное решение, но могу направить. Сначала подумай, что нужно сделать. Какие шаги потребуются?",
            RequestType.EXPLANATION: "Объясню эту концепцию. Основная идея: [концепция]. Как ты думаешь, как это можно применить?",
            RequestType.ERROR_HELP: "Чтобы найти ошибку, проверь код построчно. Где получается неожиданный результат? Что должно было быть?",
            RequestType.THEORY: "Объясню эту теорию простыми словами. Основной принцип: [принцип]. Можешь привести пример?",
            RequestType.MOTIVATION: "Ты на правильном пути! Трудности - это признак роста. Какие конкретные вопросы у тебя есть?"
        }
        return hints.get(request_type, "Чем могу помочь? Задай конкретный вопрос.")

    def stream_chat(
        self,
        user_id: str,
        message: str,
        language: str | None = None,
        context: Optional[dict] = None,
    ):
        if not language:
            language = detect_language(message)
        language = language if language in ("kz", "ru") else "ru"

        session_key = user_id
        messages = self._build_conversation_messages(session_key, message, language, context)
        continuation_prompt = (
            "Продолжи предыдущий ответ с того места, где он оборвался. "
            "Не повторяй уже сказанное. Сохраняй тот же язык и стиль."
            if language == "ru"
            else "Алдыңғы жауап үзілген жерден жалғастыр. "
            "Айтылғанды қайталама. Сол тіл мен стильді сақта."
        )

        def generator():
            collected_parts: list[str] = []
            completed = False
            current_messages = list(messages)

            try:
                attempts = 0
                while attempts <= self._MAX_CONTINUATION_ATTEMPTS:
                    stream, state = self._openrouter_stream(
                        current_messages,
                        temperature=0.7,
                        max_tokens=2048,
                    )
                    segment_parts: list[str] = []
                    for chunk in stream:
                        if chunk:
                            segment_parts.append(chunk)
                            collected_parts.append(chunk)
                            yield chunk

                    segment_text = "".join(segment_parts).strip()
                    if state.get("finish_reason") not in {"length", "max_tokens"}:
                        completed = True
                        break

                    attempts += 1
                    if attempts > self._MAX_CONTINUATION_ATTEMPTS:
                        completed = True
                        break

                    current_messages = current_messages + [
                        {"role": "assistant", "content": segment_text},
                        {"role": "user", "content": continuation_prompt},
                    ]

                if not collected_parts:
                    raise RuntimeError("Empty streamed response from OpenRouter")

                completed = True
            except httpx.HTTPStatusError as exc:
                logger.warning("OpenRouter stream failed for user_id=%s language=%s: %s", user_id, language, exc)
                fallback = self._fallback_message(language, quota=exc.response.status_code == 429)
                collected_parts = [fallback]
                completed = True
                yield fallback
            except Exception:
                logger.exception("AI stream failed for user_id=%s language=%s", user_id, language)
                fallback = self._fallback_message(language)
                collected_parts = [fallback]
                completed = True
                yield fallback
            finally:
                if completed:
                    final_text = "".join(collected_parts).strip()
                    if final_text:
                        self._append_history_message(session_key, "user", message)
                        self._append_history_message(session_key, "ai", final_text)

        return generator()

    def reset_session(self, user_id: str) -> None:
        """Reset all chat sessions for a user."""
        for key in list(self.message_history.keys()):
            if key.startswith(f"{user_id}:") or key == user_id:
                del self.message_history[key]

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
            text = self._complete_chat(
                [
                    {"role": "system", "content": self._build_system_prompt(language)},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.4,
                max_tokens=1024,
                language=language,
            )
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
            text = self._complete_chat(
                [
                    {"role": "system", "content": self._build_system_prompt(language)},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=2048,
                language=language,
            )
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

    def generate_bilingual_quiz_questions(
        self,
        topic: str,
        theory_content: str,
        num_questions: int = 3,
    ) -> dict[str, list[dict]]:
        return {
            "ru": self.generate_quiz_questions(topic, theory_content, language="ru", num_questions=num_questions),
            "kz": self.generate_quiz_questions(topic, theory_content, language="kz", num_questions=num_questions),
        }


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get AI service singleton"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
