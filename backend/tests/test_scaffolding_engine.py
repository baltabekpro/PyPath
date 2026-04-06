"""Unit tests for scaffolding engine."""
import pytest
from app.services.scaffolding_engine import (
    ScaffoldingEngine,
    ScaffoldingRule,
    RequestType,
    ConstraintType,
)


class TestScaffoldingEngine:
    """Test suite for ScaffoldingEngine."""

    def setup_method(self):
        """Set up test fixtures."""
        self.engine = ScaffoldingEngine()

    def test_initialization(self):
        """Test that engine initializes with default rules."""
        rules = self.engine.get_scaffolding_rules()
        assert len(rules) > 0
        assert all(isinstance(rule, ScaffoldingRule) for rule in rules)
        assert all(rule.active for rule in rules)

    def test_get_scaffolding_rules_returns_only_active(self):
        """Test that get_scaffolding_rules returns only active rules."""
        rules = self.engine.get_scaffolding_rules()
        # All default rules should be active
        assert all(rule.active for rule in rules)

    def test_classify_request_type_solution(self):
        """Test classification of solution requests."""
        # Russian
        assert self.engine.classify_request_type("Реши эту задачу") == RequestType.SOLUTION
        assert self.engine.classify_request_type("Напиши код для меня") == RequestType.SOLUTION
        assert self.engine.classify_request_type("Дай полное решение") == RequestType.SOLUTION
        
        # Kazakh
        assert self.engine.classify_request_type("Шешімді бер") == RequestType.SOLUTION
        assert self.engine.classify_request_type("Код жаз") == RequestType.SOLUTION

    def test_classify_request_type_error_help(self):
        """Test classification of error help requests."""
        # Russian
        assert self.engine.classify_request_type("У меня ошибка в коде") == RequestType.ERROR_HELP
        assert self.engine.classify_request_type("Не работает программа") == RequestType.ERROR_HELP
        
        # Kazakh
        assert self.engine.classify_request_type("Кодта қате бар") == RequestType.ERROR_HELP
        assert self.engine.classify_request_type("Бағдарлама жұмыс істемейді") == RequestType.ERROR_HELP

    def test_classify_request_type_theory(self):
        """Test classification of theory/explanation requests."""
        # Russian
        assert self.engine.classify_request_type("Что такое список?") == RequestType.THEORY
        assert self.engine.classify_request_type("Объясни циклы") == RequestType.THEORY
        
        # Kazakh
        assert self.engine.classify_request_type("Тізім не деген?") == RequestType.THEORY
        assert self.engine.classify_request_type("Циклдарды түсіндір") == RequestType.THEORY

    def test_classify_request_type_motivation(self):
        """Test classification of motivation requests."""
        # Russian
        assert self.engine.classify_request_type("Не могу понять") == RequestType.MOTIVATION
        assert self.engine.classify_request_type("Это слишком сложно") == RequestType.MOTIVATION
        
        # Kazakh
        assert self.engine.classify_request_type("Істей алмаймын") == RequestType.MOTIVATION
        assert self.engine.classify_request_type("Бұл өте қиын") == RequestType.MOTIVATION

    def test_classify_request_type_hint(self):
        """Test classification of hint requests."""
        # Russian
        assert self.engine.classify_request_type("Дай подсказку") == RequestType.HINT
        
        # Kazakh
        assert self.engine.classify_request_type("Кеңес бер") == RequestType.HINT

    def test_classify_request_type_default_explanation(self):
        """Test that general questions default to explanation."""
        assert self.engine.classify_request_type("Как работает функция?") == RequestType.EXPLANATION
        assert self.engine.classify_request_type("Функция қалай жұмыс істейді?") == RequestType.EXPLANATION

    def test_build_mentor_prompt_russian(self):
        """Test building Russian mentor prompt."""
        prompt = self.engine.build_mentor_prompt("ru")
        
        # Check for key components
        assert "Оракул Кода" in prompt
        assert "МЕНТОР" in prompt
        assert "scaffolding rules" in prompt
        assert "СТРОГИЕ ОГРАНИЧЕНИЯ" in prompt
        assert "русском языке" in prompt
        
        # Check that scaffolding rules are included
        assert "максимум" in prompt or "не давай" in prompt

    def test_build_mentor_prompt_kazakh(self):
        """Test building Kazakh mentor prompt."""
        prompt = self.engine.build_mentor_prompt("kz")
        
        # Check for key components
        assert "Код Оракулы" in prompt
        assert "МЕНТОР" in prompt
        assert "scaffolding rules" in prompt
        assert "ҚАТАҢ ШЕКТЕУЛЕР" in prompt
        assert "ҚАЗАҚ тілінде" in prompt
        
        # Check that scaffolding rules are included
        assert "максимум" in prompt or "берме" in prompt

    def test_build_mentor_prompt_with_context(self):
        """Test building prompt with context information."""
        context = {
            "courseTitle": "Python Basics",
            "practiceName": "Loops Practice",
            "lastError": "SyntaxError"
        }
        
        prompt_ru = self.engine.build_mentor_prompt("ru", context)
        assert "Python Basics" in prompt_ru
        assert "Loops Practice" in prompt_ru
        assert "SyntaxError" in prompt_ru
        
        prompt_kz = self.engine.build_mentor_prompt("kz", context)
        assert "Python Basics" in prompt_kz
        assert "Loops Practice" in prompt_kz
        assert "SyntaxError" in prompt_kz

    def test_build_mentor_prompt_includes_all_active_rules(self):
        """Test that prompt includes all active scaffolding rules."""
        prompt = self.engine.build_mentor_prompt("ru")
        active_rules = self.engine.get_scaffolding_rules()
        
        # At least some rules should be mentioned in the prompt
        assert len(active_rules) > 0
        # The prompt should be substantial
        assert len(prompt) > 500

    def test_scaffolding_rules_have_required_fields(self):
        """Test that all scaffolding rules have required fields."""
        rules = self.engine.get_scaffolding_rules()
        
        for rule in rules:
            assert rule.id
            assert rule.description
            assert isinstance(rule.constraint_type, ConstraintType)
            assert isinstance(rule.active, bool)

    def test_code_constraint_rules_have_max_lines(self):
        """Test that code constraint rules specify max lines."""
        rules = self.engine.get_scaffolding_rules()
        code_rules = [r for r in rules if r.constraint_type == ConstraintType.CODE and "3 lines" in r.description.lower()]
        
        # At least one code rule should specify max lines
        assert any(r.max_code_lines is not None for r in code_rules)

    def test_question_requirement_rule_exists(self):
        """Test that a rule requiring questions exists."""
        rules = self.engine.get_scaffolding_rules()
        question_rules = [r for r in rules if r.constraint_type == ConstraintType.QUESTION]
        
        assert len(question_rules) > 0
        assert any(r.requires_question for r in question_rules)
