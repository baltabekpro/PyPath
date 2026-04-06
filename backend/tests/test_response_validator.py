"""Unit tests for response validator."""
import pytest
from app.services.response_validator import (
    ResponseValidator,
    ValidationResult,
)
from app.services.scaffolding_engine import (
    ScaffoldingRule,
    RequestType,
    ConstraintType,
)


class TestResponseValidator:
    """Test suite for ResponseValidator."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = ResponseValidator()
        self.default_rules = [
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
        ]

    def test_count_code_lines_empty_response(self):
        """Test counting code lines in response without code."""
        response = "This is a text response without any code."
        assert self.validator.count_code_lines(response) == 0

    def test_count_code_lines_single_block(self):
        """Test counting code lines in single code block."""
        response = """Here's a hint:
```python
def example():
    pass
```
"""
        assert self.validator.count_code_lines(response) == 2

    def test_count_code_lines_multiple_blocks(self):
        """Test counting code lines across multiple code blocks."""
        response = """First example:
```python
x = 1
y = 2
```

Second example:
```python
print(x)
```
"""
        assert self.validator.count_code_lines(response) == 3

    def test_count_code_lines_ignores_empty_lines(self):
        """Test that empty lines in code blocks are not counted."""
        response = """```python
x = 1

y = 2

```"""
        assert self.validator.count_code_lines(response) == 2

    def test_count_code_lines_no_language_specified(self):
        """Test counting code lines when language is not specified."""
        response = """```
x = 1
y = 2
```"""
        assert self.validator.count_code_lines(response) == 2

    def test_detect_complete_solution_simple_hint(self):
        """Test that simple hints are not detected as complete solutions."""
        response = "Try using a for loop. What do you think should go inside?"
        assert not self.validator.detect_complete_solution(response)

    def test_detect_complete_solution_short_code(self):
        """Test that short code examples are not complete solutions."""
        response = """Here's the syntax:
```python
for i in range(10):
    print(i)
```
What would you change?"""
        assert not self.validator.detect_complete_solution(response)

    def test_detect_complete_solution_full_function(self):
        """Test detection of complete function implementation."""
        response = """```python
def calculate_sum(numbers):
    total = 0
    for num in numbers:
        total += num
    return total
```"""
        assert self.validator.detect_complete_solution(response)

    def test_detect_complete_solution_full_class(self):
        """Test detection of complete class implementation."""
        response = """```python
class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, x):
        self.result += x
    
    def get_result(self):
        return self.result
```"""
        assert self.validator.detect_complete_solution(response)

    def test_detect_complete_solution_essay(self):
        """Test detection of complete essay."""
        response = """
Python is a high-level programming language that is widely used for various applications. 
It was created by Guido van Rossum and first released in 1991. Python emphasizes code 
readability and allows programmers to express concepts in fewer lines of code.

The language supports multiple programming paradigms including procedural, object-oriented, 
and functional programming. Python's comprehensive standard library provides tools suited 
to many tasks and is commonly described as having a "batteries included" philosophy.

In conclusion, Python has become one of the most popular programming languages due to its 
simplicity, versatility, and strong community support. It continues to grow in popularity 
across various domains including web development, data science, and artificial intelligence.
"""
        assert self.validator.detect_complete_solution(response)

    def test_detect_complete_solution_calculation(self):
        """Test detection of complete calculation."""
        response = """
Шаг 1: 5 + 3 = 8
Шаг 2: 8 * 2 = 16
Шаг 3: 16 - 4 = 12
Ответ: 12
"""
        assert self.validator.detect_complete_solution(response)

    def test_has_leading_question_with_question(self):
        """Test detection of leading questions."""
        response = "What do you think the first step should be?"
        result = self.validator._has_leading_question(response)
        assert result is True

    def test_has_leading_question_without_question(self):
        """Test that responses without questions are detected."""
        response = "Use a for loop to iterate through the list."
        result = self.validator._has_leading_question(response)
        assert result is False

    def test_validate_response_passes_with_hint(self):
        """Test that hint responses pass validation."""
        response = "Try using a for loop. What variable would you use for counting?"
        result = self.validator.validate_response(
            response,
            RequestType.HINT,
            self.default_rules
        )
        
        assert result.passed is True
        assert result.has_leading_question is True
        assert result.is_complete_solution is False
        assert result.code_line_count == 0
        assert len(result.rules_violated) == 0

    def test_validate_response_fails_with_too_much_code(self):
        """Test that responses with too much code fail validation."""
        response = """```python
def solution():
    x = 1
    y = 2
    z = 3
    return x + y + z
```"""
        result = self.validator.validate_response(
            response,
            RequestType.SOLUTION,
            self.default_rules
        )
        
        assert result.passed is False
        assert result.code_line_count > 3
        assert "rule1" in result.rules_violated

    def test_validate_response_fails_without_question(self):
        """Test that responses without questions fail validation."""
        response = "Use a for loop to solve this problem."
        result = self.validator.validate_response(
            response,
            RequestType.HINT,
            self.default_rules
        )
        
        assert result.passed is False
        assert result.has_leading_question is False
        assert "rule4" in result.rules_violated

    def test_validate_response_fails_with_complete_essay(self):
        """Test that complete essays fail validation."""
        response = """
Python is a programming language. It has many features that make it popular.
The syntax is clean and readable, which helps beginners learn programming concepts.

Python supports multiple programming paradigms. You can write procedural code,
object-oriented code, or functional code. This flexibility makes it suitable for
many different types of projects and applications.

In conclusion, Python is an excellent choice for both beginners and experienced
developers. Its extensive libraries and active community make it a powerful tool
for solving a wide variety of programming challenges.
"""
        result = self.validator.validate_response(
            response,
            RequestType.EXPLANATION,
            self.default_rules
        )
        
        assert result.passed is False
        assert result.is_complete_solution is True
        assert "rule2" in result.rules_violated

    def test_validate_response_fails_with_complete_calculation(self):
        """Test that complete calculations fail validation."""
        response = """
Шаг 1: Сначала сложим 5 + 3 = 8
Шаг 2: Затем умножим 8 * 2 = 16
Шаг 3: И вычтем 16 - 4 = 12
Ответ: 12
"""
        result = self.validator.validate_response(
            response,
            RequestType.EXPLANATION,
            self.default_rules
        )
        
        assert result.passed is False
        assert result.is_complete_solution is True
        assert "rule3" in result.rules_violated

    def test_validate_response_tracks_applied_rules(self):
        """Test that all applied rules are tracked."""
        response = "What do you think?"
        result = self.validator.validate_response(
            response,
            RequestType.HINT,
            self.default_rules
        )
        
        # All active rules should be applied
        assert len(result.rules_applied) == len(self.default_rules)
        assert all(rule.id in result.rules_applied for rule in self.default_rules)

    def test_validate_response_skips_inactive_rules(self):
        """Test that inactive rules are not applied."""
        inactive_rules = [
            ScaffoldingRule(
                id="rule1",
                description="Test rule",
                constraint_type=ConstraintType.CODE,
                active=False  # Inactive
            )
        ]
        
        response = "Test response"
        result = self.validator.validate_response(
            response,
            RequestType.HINT,
            inactive_rules
        )
        
        assert len(result.rules_applied) == 0

    def test_confidence_score_high_for_good_hint(self):
        """Test that confidence score is high for good hints."""
        response = "Try thinking about loops. What type of loop would work here?"
        result = self.validator.validate_response(
            response,
            RequestType.HINT,
            self.default_rules
        )
        
        assert result.confidence_score > 0.8

    def test_confidence_score_low_for_violations(self):
        """Test that confidence score is low when rules are violated."""
        response = """```python
def complete_solution():
    x = 1
    y = 2
    z = 3
    return x + y + z
```"""
        result = self.validator.validate_response(
            response,
            RequestType.SOLUTION,
            self.default_rules
        )
        
        assert result.confidence_score < 0.5

    def test_is_complete_essay_short_text(self):
        """Test that short text is not considered an essay."""
        response = "This is a short response with some information."
        assert not self.validator._is_complete_essay(response)

    def test_is_complete_essay_bullet_points(self):
        """Test that bullet points are not considered an essay."""
        response = """
Key points:
- First point about Python
- Second point about syntax
- Third point about libraries
"""
        assert not self.validator._is_complete_essay(response)

    def test_is_complete_calculation_formula_only(self):
        """Test that formula explanations are not complete calculations."""
        response = "Use the formula: sum = n * (n + 1) / 2"
        assert not self.validator._is_complete_calculation(response)

    def test_is_complete_calculation_approach_description(self):
        """Test that approach descriptions are not complete calculations."""
        response = """
Чтобы решить эту задачу:
1. Сначала нужно сложить числа
2. Затем умножить результат
3. И вычесть константу
"""
        assert not self.validator._is_complete_calculation(response)

    def test_has_complete_code_implementation_javascript(self):
        """Test detection of JavaScript complete implementations."""
        response = """```javascript
function calculateSum(numbers) {
    let total = 0;
    for (let num of numbers) {
        total += num;
    }
    return total;
}
```"""
        assert self.validator._has_complete_code_implementation(response)

    def test_has_complete_code_implementation_arrow_function(self):
        """Test detection of arrow function implementations."""
        response = """```javascript
const calculateSum = (numbers) => {
    return numbers.reduce((acc, num) => acc + num, 0);
}
```"""
        assert self.validator._has_complete_code_implementation(response)

    def test_validation_result_dataclass(self):
        """Test that ValidationResult is properly structured."""
        result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1", "rule2"],
            rules_violated=[],
            code_line_count=2,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        assert result.passed is True
        assert result.request_type == RequestType.HINT
        assert len(result.rules_applied) == 2
        assert len(result.rules_violated) == 0
        assert result.code_line_count == 2
        assert result.has_leading_question is True
        assert result.is_complete_solution is False
        assert result.confidence_score == 0.9
