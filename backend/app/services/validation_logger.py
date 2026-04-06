"""Validation logger for Oracle mentor transformation.

This module records scaffolding rule applications for verification and
demonstration purposes.
"""
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional
import json
import os
from pathlib import Path
from .scaffolding_engine import RequestType
from .response_validator import ValidationResult


@dataclass
class LogEntry:
    """Represents a single validation log entry."""
    timestamp: str
    user_id: str
    request_type: str
    validation_passed: bool
    rules_applied: list[str]
    rules_violated: list[str]
    code_line_count: int
    has_leading_question: bool
    is_complete_solution: bool
    confidence_score: float


class ValidationLogger:
    """Logger for scaffolding validation interactions."""

    def __init__(self, log_file: Optional[str] = None, max_entries: int = 100):
        """Initialize the validation logger.
        
        Args:
            log_file: Path to JSON log file (defaults to data/validation_logs.json)
            max_entries: Maximum number of log entries to maintain (default: 100)
        """
        self.max_entries = max_entries
        
        # Set default log file path
        if log_file is None:
            data_dir = Path(__file__).parent.parent.parent / "data"
            data_dir.mkdir(exist_ok=True)
            self.log_file = data_dir / "validation_logs.json"
        else:
            self.log_file = Path(log_file)
        
        # Initialize log storage
        self._logs: list[LogEntry] = []
        self._load_logs()

    def log_interaction(
        self,
        user_id: str,
        request_type: RequestType,
        validation_result: ValidationResult,
        rules_applied: list[str]
    ) -> None:
        """Log a scaffolding validation interaction.
        
        Args:
            user_id: The ID of the user making the request
            request_type: The classified type of user request
            validation_result: The result of response validation
            rules_applied: List of rule IDs that were applied
        """
        # Create log entry
        entry = LogEntry(
            timestamp=datetime.utcnow().isoformat(),
            user_id=user_id,
            request_type=request_type.value,
            validation_passed=validation_result.passed,
            rules_applied=rules_applied,
            rules_violated=validation_result.rules_violated,
            code_line_count=validation_result.code_line_count,
            has_leading_question=validation_result.has_leading_question,
            is_complete_solution=validation_result.is_complete_solution,
            confidence_score=validation_result.confidence_score
        )
        
        # Add to logs
        self._logs.append(entry)
        
        # Maintain size limit (keep only most recent entries)
        if len(self._logs) > self.max_entries:
            self._logs = self._logs[-self.max_entries:]
        
        # Persist to file
        self._save_logs()

    def get_recent_logs(self, limit: int = 100) -> list[LogEntry]:
        """Retrieve recent validation logs.
        
        Args:
            limit: Maximum number of entries to return (default: 100)
            
        Returns:
            List of most recent log entries, newest first
        """
        # Return most recent entries up to limit
        return list(reversed(self._logs[-limit:]))

    def get_user_logs(self, user_id: str, limit: int = 50) -> list[LogEntry]:
        """Get logs for a specific user.
        
        Args:
            user_id: The user ID to filter by
            limit: Maximum number of entries to return (default: 50)
            
        Returns:
            List of log entries for the specified user, newest first
        """
        # Filter logs by user_id
        user_logs = [log for log in self._logs if log.user_id == user_id]
        
        # Return most recent entries up to limit
        return list(reversed(user_logs[-limit:]))

    def _load_logs(self) -> None:
        """Load logs from JSON file."""
        if not self.log_file.exists():
            self._logs = []
            return
        
        try:
            with open(self.log_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self._logs = [LogEntry(**entry) for entry in data]
                
                # Ensure we don't exceed max_entries on load
                if len(self._logs) > self.max_entries:
                    self._logs = self._logs[-self.max_entries:]
        except (json.JSONDecodeError, FileNotFoundError, KeyError):
            # If file is corrupted or missing, start fresh
            self._logs = []

    def _save_logs(self) -> None:
        """Save logs to JSON file."""
        try:
            # Ensure directory exists
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Convert logs to dictionaries
            data = [asdict(log) for log in self._logs]
            
            # Write to file
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            # Log error but don't crash the application
            print(f"Error saving validation logs: {e}")
