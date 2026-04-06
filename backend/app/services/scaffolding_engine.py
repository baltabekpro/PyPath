"""Scaffolding engine for Oracle mentor transformation.

This module implements the core scaffolding logic that prevents the AI from
providing complete solutions while enabling effective guidance through hints.
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
import re


class ConstraintType(Enum):
    """Types of scaffolding constraints."""
    CODE = "code"
    ESSAY = "essay"
    CALCULATION = "calculation"
    QUESTION = "question"


class RequestType(Enum):
    """Types of user requests."""
    HINT = "hint"
    SOLUTION = "solution"
    EXPLANATION = "explanation"
    ERROR_HELP = "error_help"
    THEORY = "theory"
    MOTIVATION = "motivation"


@dataclass
class ScaffoldingRule:
    """Represents a scaffolding rule that constrains AI responses."""
    id: str
    description: str
    constraint_type: ConstraintType
    max_code_lines: Optional[int] = None
    max_paragraph_count: Optional[int] = None
    requires_question: bool = False
    active: bool = True


class ScaffoldingEngine:
    """Engine for building mentor-mode system prompts with scaffolding constraints."""

    def __init__(self):
        """Initialize the scaffolding engine with default rules."""
        self._rules = self._initialize_default_rules()

    def _initialize_default_rules(self) -> list[ScaffoldingRule]:
        """Initialize the default scaffolding rules."""
        return [
            ScaffoldingRule(
                id="rule1",
                description="Never provide complete code implementations (>3 lines)",
                constraint_type=ConstraintType.CODE,
                max_code_lines=3,
                active=True
            ),
            ScaffoldingRule(
                id="rule2",
                description="Never write complete essays or written answers",
                constraint_type=ConstraintType.ESSAY,
                max_paragraph_count=2,
                active=True
            ),
            ScaffoldingRule(
                id="rule3",
                description="Never perform complete calculations",
                constraint_type=ConstraintType.CALCULATION,
                active=True
            ),
            ScaffoldingRule(
                id="rule4",
                description="Always include leading questions in responses",
                constraint_type=ConstraintType.QUESTION,
                requires_question=True,
                active=True
            ),
            ScaffoldingRule(
                id="rule5",
                description="Provide algorithm descriptions without implementation",
                constraint_type=ConstraintType.CODE,
                active=True
            ),
            ScaffoldingRule(
                id="rule6",
                description="Point to error locations without providing corrections",
                constraint_type=ConstraintType.CODE,
                active=True
            ),
        ]

    def get_scaffolding_rules(self) -> list[ScaffoldingRule]:
        """Return list of active scaffolding rules.
        
        Returns:
            List of active ScaffoldingRule objects
        """
        return [rule for rule in self._rules if rule.active]

    def classify_request_type(self, user_message: str) -> RequestType:
        """Classify user request type based on message content.
        
        Args:
            user_message: The user's message text
            
        Returns:
            RequestType enum value indicating the type of request
        """
        message_lower = user_message.lower()
        
        # Check for solution requests (explicit asks for complete answers)
        solution_patterns = [
            r'\bреши\b', r'\bнапиши\b', r'\bсделай\b', r'\bвыполни\b',
            r'\bшешімді\s+бер\b', r'\bжаз\b', r'\bорында\b',
            r'\bsolve\b', r'\bwrite\b', r'\bdo\b', r'\bcomplete\b',
            r'\bполное\s+решение\b', r'\bготовый\s+код\b',
            r'\bтолық\s+шешім\b', r'\bдайын\s+код\b'
        ]
        if any(re.search(pattern, message_lower) for pattern in solution_patterns):
            return RequestType.SOLUTION
        
        # Check for error help requests
        error_patterns = [
            r'\bошибка\b', r'\bне\s+работает\b', r'\bне\s+получается\b',
            r'\bқате\b', r'\bжұмыс\s+істемейді\b',
            r'\berror\b', r'\bfails?\b', r'\bdoesn\'?t\s+work\b'
        ]
        if any(re.search(pattern, message_lower) for pattern in error_patterns):
            return RequestType.ERROR_HELP
        
        # Check for theory/explanation requests
        theory_patterns = [
            r'\bчто\s+такое\b', r'\bобъясни\b', r'\bрасскажи\b',
            r'\bне\s+деген\b', r'\bтүсіндір\b', r'\bайт\b',
            r'\bwhat\s+is\b', r'\bexplain\b', r'\btell\s+me\b'
        ]
        if any(re.search(pattern, message_lower) for pattern in theory_patterns):
            return RequestType.THEORY
        
        # Check for motivation requests
        motivation_patterns = [
            r'\bне\s+могу\b', r'\bсложно\b', r'\bтрудно\b', r'\bне\s+понимаю\b',
            r'\bістей\s+алмаймын\b', r'\bқиын\b', r'\bтүсінбеймін\b',
            r'\bcan\'?t\b', r'\bdifficult\b', r'\bhard\b', r'\bdon\'?t\s+understand\b'
        ]
        if any(re.search(pattern, message_lower) for pattern in motivation_patterns):
            return RequestType.MOTIVATION
        
        # Check for hint requests (explicit asks for hints)
        hint_patterns = [
            r'\bподсказ', r'\bнамек', r'\bкеңес', r'\bhint\b', r'\bclue\b'
        ]
        if any(re.search(pattern, message_lower) for pattern in hint_patterns):
            return RequestType.HINT
        
        # Default to explanation for general questions
        return RequestType.EXPLANATION

    def build_mentor_prompt(self, language: str, context: Optional[dict] = None) -> str:
        """Build system prompt with scaffolding constraints for mentor mode.
        
        Args:
            language: Language code ('kz' for Kazakh, 'ru' for Russian)
            context: Optional context dictionary with additional information
            
        Returns:
            Complete system prompt string with scaffolding rules
        """
        # Get active rules
        active_rules = self.get_scaffolding_rules()
        
        # Build language-specific scaffolding instructions
        if language == "kz":
            scaffolding_instructions = self._build_kazakh_scaffolding(active_rules)
        else:
            scaffolding_instructions = self._build_russian_scaffolding(active_rules)
        
        # Build context-aware additions if provided
        context_additions = ""
        if context:
            context_additions = self._build_context_additions(language, context)
        
        # Combine all parts
        return f"{scaffolding_instructions}{context_additions}"

    def _build_russian_scaffolding(self, rules: list[ScaffoldingRule]) -> str:
        """Build Russian language scaffolding instructions."""
        base_prompt = """Ты - Оракул Кода, AI ментор образовательной платформы PyPath для изучения Python.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА, а не решателя задач.

Твоя роль:
- Направлять студентов к самостоятельному решению через наводящие вопросы
- Объяснять концепции и подходы, но НЕ давать готовые решения
- Помогать понять ошибки, но НЕ исправлять код за студента
- Мотивировать и поддерживать процесс обучения

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
"""
        
        # Add specific rules
        for rule in rules:
            if rule.constraint_type == ConstraintType.CODE and rule.max_code_lines:
                base_prompt += f"\n- {rule.description}: максимум {rule.max_code_lines} строки кода для примеров"
            elif rule.constraint_type == ConstraintType.ESSAY:
                base_prompt += f"\n- {rule.description}: давай структуру и ключевые пункты, не пиши полные эссе"
            elif rule.constraint_type == ConstraintType.CALCULATION:
                base_prompt += f"\n- {rule.description}: объясняй формулы и подход, не выполняй вычисления"
            elif rule.constraint_type == ConstraintType.QUESTION and rule.requires_question:
                base_prompt += f"\n- {rule.description}: каждый ответ должен содержать вопрос для размышления"
        
        base_prompt += """

Стиль общения:
- Задавай наводящие вопросы: "Что ты уже пробовал?", "Как ты думаешь, почему это не работает?"
- Давай подсказки о направлении: "Обрати внимание на...", "Попробуй подумать о..."
- Описывай алгоритм словами, без кода: "Сначала нужно..., затем..., и наконец..."
- Указывай на место ошибки, но не давай исправление: "Проверь строку 5, там проблема с..."

ВАЖНО: Отвечай СТРОГО на русском языке. Не используй казахский или английский язык в ответе."""
        
        return base_prompt

    def _build_kazakh_scaffolding(self, rules: list[ScaffoldingRule]) -> str:
        """Build Kazakh language scaffolding instructions."""
        base_prompt = """Сен - Код Оракулы, PyPath білім беру платформасының Python үйретуге арналған AI менторысың.

ӨТЕ МАҢЫЗДЫ: Сен МЕНТОР режимінде жұмыс істейсің, тапсырмаларды шешуші емессің.

Сенің рөлің:
- Студенттерді өз бетінше шешімге жетелейтін сұрақтар арқылы бағыттау
- Тұжырымдамалар мен тәсілдерді түсіндіру, бірақ дайын шешімдер БЕРМЕУ
- Қателерді түсінуге көмектесу, бірақ студент орнына кодты ТҮЗЕТПЕУ
- Оқу процесін ынталандыру және қолдау

ҚАТАҢ ШЕКТЕУЛЕР (scaffolding rules):
"""
        
        # Add specific rules
        for rule in rules:
            if rule.constraint_type == ConstraintType.CODE and rule.max_code_lines:
                base_prompt += f"\n- {rule.description}: мысалдар үшін максимум {rule.max_code_lines} жол код"
            elif rule.constraint_type == ConstraintType.ESSAY:
                base_prompt += f"\n- {rule.description}: құрылым мен негізгі тармақтарды бер, толық эссе жазба"
            elif rule.constraint_type == ConstraintType.CALCULATION:
                base_prompt += f"\n- {rule.description}: формулалар мен тәсілді түсіндір, есептеулерді орындама"
            elif rule.constraint_type == ConstraintType.QUESTION and rule.requires_question:
                base_prompt += f"\n- {rule.description}: әр жауапта ойлануға арналған сұрақ болуы керек"
        
        base_prompt += """

Қарым-қатынас стилі:
- Бағыттаушы сұрақтар қой: "Не істеп көрдің?", "Неліктен жұмыс істемейді деп ойлайсың?"
- Бағыт туралы кеңес бер: "Назар аудар...", "Ойлап көр..."
- Алгоритмді сөзбен сипатта, кодсыз: "Алдымен керек..., содан кейін..., ақырында..."
- Қате орнын көрсет, бірақ түзетуді берме: "5-жолды тексер, онда мәселе бар..."

МАҢЫЗТЫ: ТЕК ҚАЗАҚ тілінде жауап бер. Орысша немесе ағылшынша сөздер қоспа."""
        
        return base_prompt

    def _build_context_additions(self, language: str, context: dict) -> str:
        """Build context-aware additions to the system prompt."""
        additions = "\n\n"
        
        if language == "kz":
            additions += "Қосымша контекст:\n"
            if context.get("courseTitle"):
                additions += f"- Курс: {context['courseTitle']}\n"
            if context.get("practiceName"):
                additions += f"- Тәжірибе: {context['practiceName']}\n"
            if context.get("lastError"):
                additions += f"- Соңғы қате: {context['lastError']}\n"
        else:
            additions += "Дополнительный контекст:\n"
            if context.get("courseTitle"):
                additions += f"- Курс: {context['courseTitle']}\n"
            if context.get("practiceName"):
                additions += f"- Практика: {context['practiceName']}\n"
            if context.get("lastError"):
                additions += f"- Последняя ошибка: {context['lastError']}\n"
        
        return additions
