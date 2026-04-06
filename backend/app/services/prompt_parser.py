"""System prompt parser and serializer for Oracle mentor transformation.

This module provides parsing and serialization capabilities for system prompt
configurations, enabling programmatic management of scaffolding rules.
"""
from dataclasses import dataclass, field
from typing import Optional
import re


@dataclass
class PromptConfiguration:
    """Structured representation of a system prompt configuration."""
    role_description: str
    mode_description: str
    scaffolding_rules: list[str]
    communication_style: list[str]
    language_instruction: str
    context_additions: Optional[str] = None
    language: str = "ru"  # 'ru' or 'kz'


@dataclass
class ParseError:
    """Represents a parsing error with descriptive message."""
    message: str
    line_number: Optional[int] = None
    context: Optional[str] = None


class PromptParser:
    """Parser for system prompt configuration text."""
    
    # Required scaffolding rule keywords that must be present
    REQUIRED_RULE_KEYWORDS = [
        "код",  # code limit (Russian)
        "эссе",  # essay limit (Russian)
        "вычисл",  # calculation limit (Russian)
        "вопрос",  # question requirement (Russian)
    ]
    
    REQUIRED_RULE_KEYWORDS_KZ = [
        "код",  # code limit (Kazakh)
        "эссе",  # essay limit (Kazakh)
        "есепте",  # calculation limit (Kazakh)
        "сұрақ",  # question requirement (Kazakh)
    ]
    
    def __init__(self):
        """Initialize the prompt parser."""
        pass
    
    def parse(self, prompt_text: str) -> tuple[Optional[PromptConfiguration], Optional[ParseError]]:
        """Parse system prompt text into configuration object.
        
        Args:
            prompt_text: The system prompt text to parse
            
        Returns:
            Tuple of (configuration, error). If parsing succeeds, error is None.
            If parsing fails, configuration is None and error contains details.
        """
        if not prompt_text or not prompt_text.strip():
            return None, ParseError("Empty prompt text provided")
        
        try:
            # Detect language
            language = self._detect_language(prompt_text)
            
            # Extract sections
            role_description = self._extract_role_description(prompt_text, language)
            if not role_description:
                return None, ParseError("Could not find role description section")
            
            mode_description = self._extract_mode_description(prompt_text, language)
            if not mode_description:
                return None, ParseError("Could not find mode description section")
            
            scaffolding_rules = self._extract_scaffolding_rules(prompt_text, language)
            if not scaffolding_rules:
                return None, ParseError("Could not find scaffolding rules section")
            
            communication_style = self._extract_communication_style(prompt_text, language)
            if not communication_style:
                return None, ParseError("Could not find communication style section")
            
            language_instruction = self._extract_language_instruction(prompt_text, language)
            if not language_instruction:
                return None, ParseError("Could not find language instruction")
            
            context_additions = self._extract_context_additions(prompt_text, language)
            
            # Validate required rules
            validation_error = self._validate_required_rules(scaffolding_rules, language)
            if validation_error:
                return None, validation_error
            
            config = PromptConfiguration(
                role_description=role_description,
                mode_description=mode_description,
                scaffolding_rules=scaffolding_rules,
                communication_style=communication_style,
                language_instruction=language_instruction,
                context_additions=context_additions,
                language=language
            )
            
            return config, None
            
        except Exception as e:
            return None, ParseError(f"Unexpected parsing error: {str(e)}")
    
    def _detect_language(self, text: str) -> str:
        """Detect language of prompt text.
        
        Args:
            text: The prompt text
            
        Returns:
            Language code: 'kz' for Kazakh, 'ru' for Russian
        """
        # Check for Kazakh extended characters
        kazakh_chars = re.compile(r"[әіңғүұқөһӘІҢҒҮҰҚӨҺ]")
        if kazakh_chars.search(text):
            return "kz"
        return "ru"
    
    def _extract_role_description(self, text: str, language: str) -> Optional[str]:
        """Extract role description from prompt text."""
        # Look for the first paragraph that describes the role
        lines = text.split('\n')
        role_lines = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped:
                if role_lines:
                    break
                continue
            
            # First non-empty line should be role description
            if not role_lines and (
                "Оракул" in stripped or 
                "AI ментор" in stripped or
                "менторысың" in stripped
            ):
                role_lines.append(stripped)
            elif role_lines:
                # Continue until we hit a section header
                if stripped.startswith("КРИТИЧЕСКИ") or stripped.startswith("ӨТЕ"):
                    break
                role_lines.append(stripped)
        
        return '\n'.join(role_lines) if role_lines else None
    
    def _extract_mode_description(self, text: str, language: str) -> Optional[str]:
        """Extract mode description from prompt text."""
        # Look for "Твоя роль:" or "Сенің рөлің:" section
        if language == "kz":
            pattern = r"Сенің рөлің:(.*?)(?=\n\nҚАТАҢ ШЕКТЕУЛЕР|\Z)"
        else:
            pattern = r"Твоя роль:(.*?)(?=\n\nСТРОГИЕ ОГРАНИЧЕНИЯ|\Z)"
        
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        return None
    
    def _extract_scaffolding_rules(self, text: str, language: str) -> Optional[list[str]]:
        """Extract scaffolding rules from prompt text."""
        # Look for section with "СТРОГИЕ ОГРАНИЧЕНИЯ" or "ҚАТАҢ ШЕКТЕУЛЕР"
        # and extract until the next section header
        if language == "kz":
            pattern = r"ҚАТАҢ ШЕКТЕУЛЕР.*?:\s*\n(.*?)(?=\n\nҚарым-қатынас стилі:|\n\nМАҢЫЗТЫ:|\Z)"
        else:
            pattern = r"СТРОГИЕ ОГРАНИЧЕНИЯ.*?:\s*\n(.*?)(?=\n\nСтиль общения:|\n\nВАЖНО:|\Z)"
        
        match = re.search(pattern, text, re.DOTALL)
        if not match:
            return None
        
        rules_text = match.group(1).strip()
        
        # Extract individual rules (lines starting with -)
        rules = []
        for line in rules_text.split('\n'):
            stripped = line.strip()
            if stripped.startswith('-'):
                rule = stripped[1:].strip()
                if rule:
                    rules.append(rule)
        
        return rules if rules else None
    
    def _extract_communication_style(self, text: str, language: str) -> Optional[list[str]]:
        """Extract communication style guidelines from prompt text."""
        # Look for section with "Стиль общения:" or "Қарым-қатынас стилі:"
        # and extract until the next section header
        if language == "kz":
            pattern = r"Қарым-қатынас стилі:\s*\n(.*?)(?=\n\nМАҢЫЗТЫ:|\n\nҚосымша контекст:|\Z)"
        else:
            pattern = r"Стиль общения:\s*\n(.*?)(?=\n\nВАЖНО:|\n\nДополнительный контекст:|\Z)"
        
        match = re.search(pattern, text, re.DOTALL)
        if not match:
            return None
        
        style_text = match.group(1).strip()
        
        # Extract individual style points (lines starting with -)
        styles = []
        for line in style_text.split('\n'):
            stripped = line.strip()
            if stripped.startswith('-'):
                style = stripped[1:].strip()
                if style:
                    styles.append(style)
        
        return styles if styles else None
    
    def _extract_language_instruction(self, text: str, language: str) -> Optional[str]:
        """Extract language instruction from prompt text."""
        # Look for standalone "ВАЖНО:" or "МАҢЫЗТЫ:" section at the end
        # This should be after communication style and not part of "КРИТИЧЕСКИ ВАЖНО"
        if language == "kz":
            # Match МАҢЫЗТЫ: that's not preceded by other text on the same line
            pattern = r"(?:^|\n)МАҢЫЗТЫ:\s*(.+?)(?=\n\nҚосымша контекст:|\Z)"
        else:
            # Match ВАЖНО: that's not preceded by other text on the same line
            pattern = r"(?:^|\n)ВАЖНО:\s*(.+?)(?=\n\nДополнительный контекст:|\Z)"
        
        match = re.search(pattern, text, re.DOTALL | re.MULTILINE)
        if match:
            return match.group(1).strip()
        
        # If not found, it's required so return None to trigger error
        return None
    
    def _extract_context_additions(self, text: str, language: str) -> Optional[str]:
        """Extract context additions section if present."""
        # Look for "Дополнительный контекст:" or "Қосымша контекст:"
        if language == "kz":
            pattern = r"Қосымша контекст:(.*?)(?=\Z)"
        else:
            pattern = r"Дополнительный контекст:(.*?)(?=\Z)"
        
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        return None
    
    def _validate_required_rules(self, rules: list[str], language: str) -> Optional[ParseError]:
        """Validate that all required scaffolding rules are present.
        
        Args:
            rules: List of scaffolding rules
            language: Language code ('kz' or 'ru')
            
        Returns:
            ParseError if validation fails, None if all required rules present
        """
        rules_text = ' '.join(rules).lower()
        
        required_keywords = (
            self.REQUIRED_RULE_KEYWORDS_KZ if language == "kz" 
            else self.REQUIRED_RULE_KEYWORDS
        )
        
        missing_rules = []
        for keyword in required_keywords:
            if keyword not in rules_text:
                missing_rules.append(keyword)
        
        if missing_rules:
            return ParseError(
                f"Missing required scaffolding rules. Missing keywords: {', '.join(missing_rules)}. "
                f"Required rules must cover: code limits, essay limits, calculation limits, and question requirements."
            )
        
        return None


class PromptPrettyPrinter:
    """Pretty printer for system prompt configurations."""
    
    def __init__(self):
        """Initialize the pretty printer."""
        pass
    
    def format(self, config: PromptConfiguration) -> str:
        """Format configuration object into system prompt text.
        
        Args:
            config: The configuration object to format
            
        Returns:
            Formatted system prompt text
        """
        lines = []
        
        # Add role description
        lines.append(config.role_description)
        lines.append("")
        
        # Add mode description with header
        if config.language == "kz":
            lines.append("ӨТЕ МАҢЫЗДЫ: Сен МЕНТОР режимінде жұмыс істейсің, тапсырмаларды шешуші емессің.")
            lines.append("")
            lines.append("Сенің рөлің:")
        else:
            lines.append("КРИТИЧЕСКИ ВАЖНО: Ты работаешь в режиме МЕНТОРА, а не решателя задач.")
            lines.append("")
            lines.append("Твоя роль:")
        
        for line in config.mode_description.split('\n'):
            lines.append(line)
        lines.append("")
        
        # Add scaffolding rules
        if config.language == "kz":
            lines.append("ҚАТАҢ ШЕКТЕУЛЕР (scaffolding rules):")
        else:
            lines.append("СТРОГИЕ ОГРАНИЧЕНИЯ (scaffolding rules):")
        
        for rule in config.scaffolding_rules:
            lines.append(f"- {rule}")
        lines.append("")
        
        # Add communication style
        if config.language == "kz":
            lines.append("Қарым-қатынас стилі:")
        else:
            lines.append("Стиль общения:")
        
        for style in config.communication_style:
            lines.append(f"- {style}")
        lines.append("")
        
        # Add language instruction
        if config.language == "kz":
            lines.append("МАҢЫЗТЫ: " + config.language_instruction)
        else:
            lines.append("ВАЖНО: " + config.language_instruction)
        
        # Add context additions if present
        if config.context_additions:
            lines.append("")
            if config.language == "kz":
                lines.append("Қосымша контекст:")
            else:
                lines.append("Дополнительный контекст:")
            lines.append(config.context_additions)
        
        return '\n'.join(lines)
