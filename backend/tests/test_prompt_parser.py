"""Unit tests for prompt parser and pretty printer."""
import pytest
from app.services.prompt_parser import (
    PromptParser,
    PromptPrettyPrinter,
    PromptConfiguration,
    ParseError,
)


class TestPromptParser:
    """Test suite for PromptParser."""

    def setup_method(self):
        """Set up test fixtures."""
        self.parser = PromptParser()
        self.printer = PromptPrettyPrinter()
        
        # Sample valid Russian prompt
        self.valid_russian_prompt = """Ты - Оракул Кода, AI ментор образовательной платформы PyPath для изучения Python.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА, а не решателя задач.

Твоя роль:
- Направлять студентов к самостоятельному решению через наводящие вопросы
- Объяснять концепции и подходы, но НЕ давать готовые решения

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода (>3 строки)
- Никогда не пиши полные эссе или письменные ответы
- Никогда не выполняй полные вычисления
- Всегда включай наводящие вопросы в ответы

Стиль общения:
- Задавай наводящие вопросы: "Что ты уже пробовал?"
- Давай подсказки о направлении: "Обрати внимание на..."

ВАЖНО: Отвечай СТРОГО на русском языке."""

        # Sample valid Kazakh prompt
        self.valid_kazakh_prompt = """Сен - Код Оракулы, PyPath білім беру платформасының Python үйретуге арналған AI менторысың.

ӨТЕ МАҢЫЗДЫ: Сен МЕНТОР режимінде жұмыс істейсің, тапсырмаларды шешуші емессің.

Сенің рөлің:
- Студенттерді өз бетінше шешімге жетелейтін сұрақтар арқылы бағыттау
- Тұжырымдамалар мен тәсілдерді түсіндіру

ҚАТАҢ ШЕКТЕУЛЕР (scaffolding rules):
- Ешқашан толық код іске асыруларын бермеңіз (>3 жол)
- Ешқашан толық эссе немесе жазбаша жауаптар жазбаңыз
- Ешқашан толық есептеулерді орындамаңыз
- Әрқашан жауаптарға бағыттаушы сұрақтарды қосыңыз

Қарым-қатынас стилі:
- Бағыттаушы сұрақтар қой: "Не істеп көрдің?"
- Бағыт туралы кеңес бер: "Назар аудар..."

МАҢЫЗТЫ: ТЕК ҚАЗАҚ тілінде жауап бер."""

    def test_parse_valid_russian_prompt(self):
        """Test parsing a valid Russian prompt."""
        config, error = self.parser.parse(self.valid_russian_prompt)
        
        assert error is None
        assert config is not None
        assert config.language == "ru"
        assert "Оракул Кода" in config.role_description
        assert len(config.scaffolding_rules) == 4
        assert len(config.communication_style) == 2
        assert "русском языке" in config.language_instruction

    def test_parse_valid_kazakh_prompt(self):
        """Test parsing a valid Kazakh prompt."""
        config, error = self.parser.parse(self.valid_kazakh_prompt)
        
        assert error is None
        assert config is not None
        assert config.language == "kz"
        assert "Код Оракулы" in config.role_description
        assert len(config.scaffolding_rules) == 4
        assert len(config.communication_style) == 2
        assert "ҚАЗАҚ тілінде" in config.language_instruction

    def test_parse_empty_prompt(self):
        """Test parsing empty prompt returns error."""
        config, error = self.parser.parse("")
        
        assert config is None
        assert error is not None
        assert "Empty prompt text" in error.message

    def test_parse_missing_role_description(self):
        """Test parsing prompt without role description."""
        invalid_prompt = """СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "role description" in error.message.lower()

    def test_parse_missing_scaffolding_rules(self):
        """Test parsing prompt without scaffolding rules."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "scaffolding rules" in error.message.lower()

    def test_parse_missing_communication_style(self):
        """Test parsing prompt without communication style."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не пиши полные эссе
- Никогда не выполняй полные вычисления
- Всегда включай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "communication style" in error.message.lower()

    def test_parse_missing_language_instruction(self):
        """Test parsing prompt without language instruction."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не пиши полные эссе
- Никогда не выполняй полные вычисления
- Всегда включай вопросы

Стиль общения:
- Задавай вопросы"""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "language instruction" in error.message.lower()

    def test_parse_missing_required_rule_code(self):
        """Test validation fails when code limit rule is missing."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не пиши полные эссе
- Никогда не выполняй полные вычисления
- Всегда включай вопросы

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "Missing required scaffolding rules" in error.message
        assert "код" in error.message.lower()

    def test_parse_missing_required_rule_essay(self):
        """Test validation fails when essay limit rule is missing."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не выполняй полные вычисления
- Всегда включай вопросы

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "Missing required scaffolding rules" in error.message
        assert "эссе" in error.message.lower()

    def test_parse_missing_required_rule_calculation(self):
        """Test validation fails when calculation limit rule is missing."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не пиши полные эссе
- Всегда включай вопросы

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "Missing required scaffolding rules" in error.message
        assert "вычисл" in error.message.lower()

    def test_parse_missing_required_rule_question(self):
        """Test validation fails when question requirement rule is missing."""
        invalid_prompt = """Ты - Оракул Кода, AI ментор.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не пиши полные эссе
- Никогда не выполняй полные вычисления

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config, error = self.parser.parse(invalid_prompt)
        
        assert config is None
        assert error is not None
        assert "Missing required scaffolding rules" in error.message
        assert "вопрос" in error.message.lower()

    def test_parse_with_context_additions(self):
        """Test parsing prompt with context additions."""
        prompt_with_context = self.valid_russian_prompt + """

Дополнительный контекст:
- Курс: Python Basics
- Практика: Loops and Conditionals"""
        
        config, error = self.parser.parse(prompt_with_context)
        
        assert error is None
        assert config is not None
        assert config.context_additions is not None
        assert "Python Basics" in config.context_additions

    def test_detect_language_russian(self):
        """Test language detection for Russian text."""
        russian_text = "Это русский текст без казахских символов"
        language = self.parser._detect_language(russian_text)
        assert language == "ru"

    def test_detect_language_kazakh(self):
        """Test language detection for Kazakh text."""
        kazakh_text = "Бұл қазақ тілінде жазылған мәтін"
        language = self.parser._detect_language(kazakh_text)
        assert language == "kz"


class TestPromptPrettyPrinter:
    """Test suite for PromptPrettyPrinter."""

    def setup_method(self):
        """Set up test fixtures."""
        self.parser = PromptParser()
        self.printer = PromptPrettyPrinter()

    def test_format_russian_configuration(self):
        """Test formatting Russian configuration."""
        config = PromptConfiguration(
            role_description="Ты - Оракул Кода, AI ментор.",
            mode_description="- Направлять студентов\n- Объяснять концепции",
            scaffolding_rules=[
                "Никогда не предоставляй полные реализации кода",
                "Никогда не пиши полные эссе",
                "Никогда не выполняй полные вычисления",
                "Всегда включай вопросы"
            ],
            communication_style=[
                "Задавай вопросы",
                "Давай подсказки"
            ],
            language_instruction="Отвечай СТРОГО на русском языке.",
            language="ru"
        )
        
        formatted = self.printer.format(config)
        
        assert "Оракул Кода" in formatted
        assert "КРИТИЧЕСКИ ВАЖНО" in formatted
        assert "СТРОГИЕ ОГРАНИЧЕНИЯ" in formatted
        assert "Стиль общения:" in formatted
        assert "ВАЖНО:" in formatted
        assert all(rule in formatted for rule in config.scaffolding_rules)
        assert all(style in formatted for style in config.communication_style)

    def test_format_kazakh_configuration(self):
        """Test formatting Kazakh configuration."""
        config = PromptConfiguration(
            role_description="Сен - Код Оракулы, AI менторысың.",
            mode_description="- Студенттерді бағыттау\n- Тұжырымдамаларды түсіндіру",
            scaffolding_rules=[
                "Ешқашан толық код бермеңіз",
                "Ешқашан толық эссе жазбаңыз",
                "Ешқашан толық есептеулерді орындамаңыз",
                "Әрқашан сұрақтарды қосыңыз"
            ],
            communication_style=[
                "Сұрақтар қой",
                "Кеңес бер"
            ],
            language_instruction="ТЕК ҚАЗАҚ тілінде жауап бер.",
            language="kz"
        )
        
        formatted = self.printer.format(config)
        
        assert "Код Оракулы" in formatted
        assert "ӨТЕ МАҢЫЗДЫ" in formatted
        assert "ҚАТАҢ ШЕКТЕУЛЕР" in formatted
        assert "Қарым-қатынас стилі:" in formatted
        assert "МАҢЫЗТЫ:" in formatted
        assert all(rule in formatted for rule in config.scaffolding_rules)
        assert all(style in formatted for style in config.communication_style)

    def test_format_with_context_additions(self):
        """Test formatting configuration with context additions."""
        config = PromptConfiguration(
            role_description="Ты - Оракул Кода.",
            mode_description="- Направлять студентов",
            scaffolding_rules=["Никогда не давай полный код"],
            communication_style=["Задавай вопросы"],
            language_instruction="Отвечай на русском.",
            context_additions="- Курс: Python\n- Практика: Loops",
            language="ru"
        )
        
        formatted = self.printer.format(config)
        
        assert "Дополнительный контекст:" in formatted
        assert "Курс: Python" in formatted
        assert "Практика: Loops" in formatted

    def test_format_without_context_additions(self):
        """Test formatting configuration without context additions."""
        config = PromptConfiguration(
            role_description="Ты - Оракул Кода.",
            mode_description="- Направлять студентов",
            scaffolding_rules=["Никогда не давай полный код"],
            communication_style=["Задавай вопросы"],
            language_instruction="Отвечай на русском.",
            language="ru"
        )
        
        formatted = self.printer.format(config)
        
        assert "Дополнительный контекст:" not in formatted


class TestRoundTripConversion:
    """Test suite for round-trip parsing and formatting."""

    def setup_method(self):
        """Set up test fixtures."""
        self.parser = PromptParser()
        self.printer = PromptPrettyPrinter()

    def test_round_trip_russian_prompt(self):
        """Test that parsing then formatting produces equivalent configuration."""
        original_prompt = """Ты - Оракул Кода, AI ментор образовательной платформы PyPath.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА, а не решателя задач.

Твоя роль:
- Направлять студентов к самостоятельному решению
- Объяснять концепции и подходы

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода (>3 строки)
- Никогда не пиши полные эссе или письменные ответы
- Никогда не выполняй полные вычисления
- Всегда включай наводящие вопросы в ответы

Стиль общения:
- Задавай наводящие вопросы
- Давай подсказки о направлении

ВАЖНО: Отвечай СТРОГО на русском языке."""
        
        # Parse original
        config1, error1 = self.parser.parse(original_prompt)
        assert error1 is None
        assert config1 is not None
        
        # Format to text
        formatted = self.printer.format(config1)
        
        # Parse formatted text
        config2, error2 = self.parser.parse(formatted)
        assert error2 is None
        assert config2 is not None
        
        # Compare configurations
        assert config1.language == config2.language
        assert len(config1.scaffolding_rules) == len(config2.scaffolding_rules)
        assert len(config1.communication_style) == len(config2.communication_style)
        assert config1.language_instruction == config2.language_instruction

    def test_round_trip_kazakh_prompt(self):
        """Test round-trip conversion for Kazakh prompt."""
        original_prompt = """Сен - Код Оракулы, PyPath платформасының AI менторысың.

ӨТЕ МАҢЫЗДЫ: Сен МЕНТОР режимінде жұмыс істейсің.

Сенің рөлің:
- Студенттерді бағыттау
- Тұжырымдамаларды түсіндіру

ҚАТАҢ ШЕКТЕУЛЕР (scaffolding rules):
- Ешқашан толық код іске асыруларын бермеңіз
- Ешқашан толық эссе жазбаңыз
- Ешқашан толық есептеулерді орындамаңыз
- Әрқашан бағыттаушы сұрақтарды қосыңыз

Қарым-қатынас стилі:
- Бағыттаушы сұрақтар қой
- Бағыт туралы кеңес бер

МАҢЫЗТЫ: ТЕК ҚАЗАҚ тілінде жауап бер."""
        
        # Parse original
        config1, error1 = self.parser.parse(original_prompt)
        assert error1 is None
        assert config1 is not None
        
        # Format to text
        formatted = self.printer.format(config1)
        
        # Parse formatted text
        config2, error2 = self.parser.parse(formatted)
        assert error2 is None
        assert config2 is not None
        
        # Compare configurations
        assert config1.language == config2.language
        assert len(config1.scaffolding_rules) == len(config2.scaffolding_rules)
        assert len(config1.communication_style) == len(config2.communication_style)

    def test_round_trip_preserves_all_rules(self):
        """Test that round-trip preserves all scaffolding rules."""
        original_prompt = """Ты - Оракул Кода.

КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА.

Твоя роль:
- Направлять студентов

СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):
- Никогда не предоставляй полные реализации кода
- Никогда не пиши полные эссе
- Никогда не выполняй полные вычисления
- Всегда включай вопросы
- Дополнительное правило для тестирования

Стиль общения:
- Задавай вопросы

ВАЖНО: Отвечай на русском языке."""
        
        config1, _ = self.parser.parse(original_prompt)
        formatted = self.printer.format(config1)
        config2, _ = self.parser.parse(formatted)
        
        # All rules should be preserved
        assert len(config1.scaffolding_rules) == len(config2.scaffolding_rules)
        assert len(config1.scaffolding_rules) == 5  # Including the additional rule


class TestParseError:
    """Test suite for ParseError dataclass."""

    def test_parse_error_with_message_only(self):
        """Test ParseError with message only."""
        error = ParseError("Test error message")
        assert error.message == "Test error message"
        assert error.line_number is None
        assert error.context is None

    def test_parse_error_with_line_number(self):
        """Test ParseError with line number."""
        error = ParseError("Test error", line_number=42)
        assert error.message == "Test error"
        assert error.line_number == 42

    def test_parse_error_with_context(self):
        """Test ParseError with context."""
        error = ParseError("Test error", context="Some context")
        assert error.message == "Test error"
        assert error.context == "Some context"
