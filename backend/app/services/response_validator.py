"""Response validator for Oracle mentor transformation.

This module validates AI responses to ensure they comply with scaffolding rules
and do not provide complete solutions.
"""
from dataclasses import dataclass
from typing import Optional
import re
from .scaffolding_engine import ScaffoldingRule, RequestType, ConstraintType


# Kazakh extended characters (unique to Kazakh, not in Russian)
_KAZAKH_CHARS = re.compile(r"[әіңғүұқөһӘІҢҒҮҰҚӨҺ]")

# Russian Cyrillic characters (not including Kazakh extended)
_RUSSIAN_CHARS = re.compile(r"[а-яА-ЯёЁ]")

# English characters
_ENGLISH_CHARS = re.compile(r"[a-zA-Z]")


@dataclass
class ValidationResult:
    """Result of response validation against scaffolding rules."""
    passed: bool
    request_type: RequestType
    rules_applied: list[str]
    rules_violated: list[str]
    code_line_count: int
    has_leading_question: bool
    is_complete_solution: bool
    confidence_score: float  # 0.0 to 1.0


class ResponseValidator:
    """Validates AI responses against scaffolding rules."""

    def __init__(self):
        """Initialize the response validator."""
        pass

    def validate_response(
        self,
        response: str,
        request_type: RequestType,
        rules: list[ScaffoldingRule]
    ) -> ValidationResult:
        """Validate response against scaffolding rules.
        
        Args:
            response: The AI response text to validate
            request_type: The classified type of user request
            rules: List of active scaffolding rules to apply
            
        Returns:
            ValidationResult with validation details
        """
        rules_applied = []
        rules_violated = []
        
        # Count code lines
        code_line_count = self.count_code_lines(response)
        
        # Check for leading questions
        has_leading_question = self._has_leading_question(response)
        
        # Detect complete solution
        is_complete_solution = self.detect_complete_solution(response)
        
        # Apply each rule
        for rule in rules:
            if not rule.active:
                continue
                
            rules_applied.append(rule.id)
            
            # Check code line limit
            if rule.constraint_type == ConstraintType.CODE and rule.max_code_lines:
                if code_line_count > rule.max_code_lines:
                    rules_violated.append(rule.id)
            
            # Check essay constraint
            if rule.constraint_type == ConstraintType.ESSAY:
                if self._is_complete_essay(response):
                    rules_violated.append(rule.id)
            
            # Check calculation constraint
            if rule.constraint_type == ConstraintType.CALCULATION:
                if self._is_complete_calculation(response):
                    rules_violated.append(rule.id)
            
            # Check question requirement
            if rule.constraint_type == ConstraintType.QUESTION and rule.requires_question:
                if not has_leading_question:
                    rules_violated.append(rule.id)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence(
            code_line_count,
            has_leading_question,
            is_complete_solution,
            len(rules_violated)
        )
        
        # Determine if validation passed
        passed = len(rules_violated) == 0 and not is_complete_solution
        
        return ValidationResult(
            passed=passed,
            request_type=request_type,
            rules_applied=rules_applied,
            rules_violated=rules_violated,
            code_line_count=code_line_count,
            has_leading_question=has_leading_question,
            is_complete_solution=is_complete_solution,
            confidence_score=confidence_score
        )

    def detect_complete_solution(self, response: str) -> bool:
        """Detect if response contains a complete solution.
        
        Args:
            response: The AI response text
            
        Returns:
            True if response contains a complete solution
        """
        # Check for complete code implementations
        if self._has_complete_code_implementation(response):
            return True
        
        # Check for complete essays
        if self._is_complete_essay(response):
            return True
        
        # Check for complete calculations
        if self._is_complete_calculation(response):
            return True
        
        return False

    def count_code_lines(self, response: str) -> int:
        """Count lines of code in response.
        
        Parses markdown code blocks (```python```, ```javascript```, etc.)
        and counts the number of non-empty lines.
        
        Args:
            response: The AI response text
            
        Returns:
            Total number of code lines across all code blocks
        """
        # Pattern to match code blocks: ```language\ncode\n```
        code_block_pattern = r'```(?:\w+)?\n(.*?)```'
        code_blocks = re.findall(code_block_pattern, response, re.DOTALL)
        
        total_lines = 0
        for block in code_blocks:
            # Split by newlines and count non-empty lines
            lines = [line.strip() for line in block.split('\n')]
            non_empty_lines = [line for line in lines if line]
            total_lines += len(non_empty_lines)
        
        return total_lines

    def _has_leading_question(self, response: str) -> bool:
        """Check if response contains leading questions.
        
        Args:
            response: The AI response text
            
        Returns:
            True if response contains at least one question mark
        """
        return '?' in response

    def _has_complete_code_implementation(self, response: str) -> bool:
        """Check if response contains complete code implementation.
        
        Args:
            response: The AI response text
            
        Returns:
            True if response contains complete function or class definitions
        """
        # Check for complete function definitions
        function_patterns = [
            r'def\s+\w+\s*\([^)]*\)\s*:\s*\n(?:\s+.+\n){3,}',  # Python function with 3+ lines
            r'function\s+\w+\s*\([^)]*\)\s*\{[^}]{50,}\}',  # JavaScript function
            r'const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]{50,}\}',  # Arrow function
        ]
        
        for pattern in function_patterns:
            if re.search(pattern, response, re.MULTILINE):
                return True
        
        # Check for complete class definitions
        class_patterns = [
            r'class\s+\w+.*?:\s*\n(?:\s+.+\n){5,}',  # Python class with 5+ lines
            r'class\s+\w+\s*\{[^}]{100,}\}',  # JavaScript class
        ]
        
        for pattern in class_patterns:
            if re.search(pattern, response, re.MULTILINE):
                return True
        
        return False

    def _is_complete_essay(self, response: str) -> bool:
        """Check if response is a complete essay.
        
        Args:
            response: The AI response text
            
        Returns:
            True if response contains multiple complete paragraphs forming an essay
        """
        # Remove code blocks to avoid false positives
        text_without_code = re.sub(r'```.*?```', '', response, flags=re.DOTALL)
        
        # Split into paragraphs (separated by double newlines or single newlines with substantial text)
        paragraphs = [p.strip() for p in text_without_code.split('\n\n') if p.strip()]
        
        # Count substantial paragraphs (more than 100 characters)
        substantial_paragraphs = [p for p in paragraphs if len(p) > 100]
        
        # If there are 3+ substantial paragraphs, it's likely a complete essay
        if len(substantial_paragraphs) >= 3:
            return True
        
        # Check for essay-like structure (introduction, body, conclusion indicators)
        essay_indicators = [
            r'в заключени',  # Russian: in conclusion
            r'таким образом',  # Russian: thus
            r'в итоге',  # Russian: in the end
            r'қорытынды',  # Kazakh: conclusion
            r'сонымен',  # Kazakh: thus
            r'in conclusion',
            r'to summarize',
        ]
        
        indicator_count = sum(1 for indicator in essay_indicators 
                             if re.search(indicator, text_without_code, re.IGNORECASE))
        
        # If multiple essay indicators and substantial text, likely an essay
        if indicator_count >= 2 and len(text_without_code) > 500:
            return True
        
        return False

    def _is_complete_calculation(self, response: str) -> bool:
        """Check if response contains complete calculation.
        
        Args:
            response: The AI response text
            
        Returns:
            True if response contains step-by-step arithmetic with final answer
        """
        # Look for step-by-step calculation patterns
        calculation_patterns = [
            r'\d+\s*[+\-*/]\s*\d+\s*=\s*\d+',  # Basic arithmetic: 5 + 3 = 8
            r'шаг\s+\d+:.*?\d+',  # Russian: step 1: ... number
            r'қадам\s+\d+:.*?\d+',  # Kazakh: step 1: ... number
            r'step\s+\d+:.*?\d+',  # English: step 1: ... number
        ]
        
        matches = 0
        for pattern in calculation_patterns:
            matches += len(re.findall(pattern, response, re.IGNORECASE))
        
        # If there are 3+ calculation steps, it's likely a complete calculation
        if matches >= 3:
            return True
        
        # Check for final answer indicators
        final_answer_patterns = [
            r'ответ:?\s*\d+',  # Russian: answer: number
            r'жауап:?\s*\d+',  # Kazakh: answer: number
            r'answer:?\s*\d+',  # English: answer: number
            r'результат:?\s*\d+',  # Russian: result: number
            r'нәтиже:?\s*\d+',  # Kazakh: result: number
        ]
        
        has_final_answer = any(re.search(pattern, response, re.IGNORECASE) 
                              for pattern in final_answer_patterns)
        
        # If there are calculation steps AND a final answer, it's complete
        if matches >= 2 and has_final_answer:
            return True
        
        return False

    def validate_language_purity(self, response: str, expected_language: str) -> tuple[bool, list[str]]:
        """Validate that response doesn't mix languages.
        
        Args:
            response: The AI response text
            expected_language: Expected language code ('kz' or 'ru')
            
        Returns:
            Tuple of (is_pure, violations) where violations is a list of detected issues
        """
        violations = []
        
        # Remove code blocks to avoid false positives from code
        text_without_code = re.sub(r'```.*?```', '', response, flags=re.DOTALL)
        
        # Remove inline code (backticks)
        text_without_code = re.sub(r'`[^`]+`', '', text_without_code)
        
        # Remove URLs
        text_without_code = re.sub(r'https?://\S+', '', text_without_code)
        
        if expected_language == "kz":
            # For Kazakh responses, check for English words (more than just variable names)
            # Kazakh uses Cyrillic alphabet, so Russian characters are expected
            words = re.findall(r'\b[a-zA-Z]{4,}\b', text_without_code)
            english_word_count = len(words)
            
            # If more than 5 English words, flag it
            if english_word_count > 5:
                violations.append(f"Detected {english_word_count} English words in Kazakh response")
                
        elif expected_language == "ru":
            # For Russian responses, check for Kazakh extended characters
            # These characters should not appear in pure Russian text
            if _KAZAKH_CHARS.search(text_without_code):
                kazakh_chars = _KAZAKH_CHARS.findall(text_without_code)
                violations.append(f"Detected {len(kazakh_chars)} Kazakh extended characters in Russian response")
            
            # Check for English words (more than just variable names)
            words = re.findall(r'\b[a-zA-Z]{4,}\b', text_without_code)
            if len(words) > 5:
                violations.append(f"Detected {len(words)} English words in Russian response")
        
        return len(violations) == 0, violations

    def detect_language_mixing(self, response: str) -> bool:
        """Detect if response mixes multiple languages inappropriately.
        
        Args:
            response: The AI response text
            
        Returns:
            True if language mixing is detected
        """
        # Remove code blocks
        text_without_code = re.sub(r'```.*?```', '', response, flags=re.DOTALL)
        text_without_code = re.sub(r'`[^`]+`', '', text_without_code)
        
        # Check for presence of different language character sets
        has_kazakh = bool(_KAZAKH_CHARS.search(text_without_code))
        has_russian = bool(_RUSSIAN_CHARS.search(text_without_code))
        has_english = bool(re.search(r'\b[a-zA-Z]{4,}\b', text_without_code))
        
        # Count how many language types are present
        language_count = sum([has_kazakh, has_russian, has_english])
        
        # If more than one language is significantly present, it's mixing
        return language_count > 1

    def _calculate_confidence(
        self,
        code_line_count: int,
        has_leading_question: bool,
        is_complete_solution: bool,
        violations_count: int
    ) -> float:
        """Calculate confidence score for validation result.
        
        Args:
            code_line_count: Number of code lines in response
            has_leading_question: Whether response has leading questions
            is_complete_solution: Whether response is a complete solution
            violations_count: Number of rule violations
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        confidence = 1.0
        
        # Reduce confidence for each violation
        confidence -= violations_count * 0.15
        
        # Reduce confidence if complete solution detected
        if is_complete_solution:
            confidence -= 0.3
        
        # Reduce confidence for excessive code
        if code_line_count > 5:
            confidence -= 0.2
        elif code_line_count > 3:
            confidence -= 0.1
        
        # Increase confidence if has leading questions
        if has_leading_question:
            confidence += 0.1
        
        # Clamp to [0.0, 1.0]
        return max(0.0, min(1.0, confidence))
