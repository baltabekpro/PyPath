"""Unit tests for language purity validation."""
import pytest
from app.services.response_validator import ResponseValidator


class TestLanguagePurity:
    """Test suite for language purity validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = ResponseValidator()

    def test_validate_kazakh_purity_pure_kazakh(self):
        """Test that pure Kazakh text passes validation."""
        response = "Бұл қазақ тіліндегі мәтін. Ол таза қазақша жазылған."
        is_pure, violations = self.validator.validate_language_purity(response, "kz")
        assert is_pure
        assert len(violations) == 0

    def test_validate_kazakh_purity_with_russian_words(self):
        """Test that Kazakh text with many English words fails validation."""
        # Note: Detecting Russian words in Kazakh is complex since both use Cyrillic
        # We focus on detecting English word mixing instead
        response = "Бұл қазақ тіліндегі мәтін. But here there are many English words that should not be present in text."
        is_pure, violations = self.validator.validate_language_purity(response, "kz")
        assert not is_pure
        assert len(violations) > 0
        assert "English words" in violations[0]

    def test_validate_kazakh_purity_with_code_blocks(self):
        """Test that code blocks don't affect Kazakh purity validation."""
        response = """Бұл қазақ тіліндегі мәтін.
        
```python
def hello():
    print("Hello World")
```

Код блогы ағылшын сөздерін қамтиды, бірақ бұл жарайды."""
        is_pure, violations = self.validator.validate_language_purity(response, "kz")
        assert is_pure
        assert len(violations) == 0

    def test_validate_russian_purity_pure_russian(self):
        """Test that pure Russian text passes validation."""
        response = "Это текст на русском языке. Он написан полностью по-русски."
        is_pure, violations = self.validator.validate_language_purity(response, "ru")
        assert is_pure
        assert len(violations) == 0

    def test_validate_russian_purity_with_kazakh_chars(self):
        """Test that Russian text with Kazakh characters fails validation."""
        response = "Это текст на русском языке. Но здесь есть қазақ әріптері."
        is_pure, violations = self.validator.validate_language_purity(response, "ru")
        assert not is_pure
        assert len(violations) > 0
        assert "Kazakh" in violations[0]

    def test_validate_russian_purity_with_code_blocks(self):
        """Test that code blocks don't affect Russian purity validation."""
        response = """Это текст на русском языке.
        
```python
def hello():
    print("Hello World")
```

Код содержит английские слова, но это нормально."""
        is_pure, violations = self.validator.validate_language_purity(response, "ru")
        assert is_pure
        assert len(violations) == 0

    def test_detect_language_mixing_no_mixing(self):
        """Test that single-language text doesn't trigger mixing detection."""
        response = "Это чисто русский текст без примесей других языков."
        assert not self.validator.detect_language_mixing(response)

    def test_detect_language_mixing_with_mixing(self):
        """Test that mixed-language text triggers mixing detection."""
        response = "Это русский текст with English words mixed in."
        assert self.validator.detect_language_mixing(response)

    def test_detect_language_mixing_kazakh_russian(self):
        """Test that Kazakh-Russian mixing is detected."""
        response = "Бұл қазақ мәтін с русскими словами."
        assert self.validator.detect_language_mixing(response)

    def test_detect_language_mixing_ignores_code(self):
        """Test that code blocks don't trigger mixing detection."""
        response = """Это русский текст.
        
```python
def hello():
    print("Hello World")
```

Продолжение на русском."""
        assert not self.validator.detect_language_mixing(response)
