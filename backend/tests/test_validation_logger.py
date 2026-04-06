"""Unit tests for validation logger."""
import pytest
import tempfile
import json
from pathlib import Path
from app.services.validation_logger import ValidationLogger, LogEntry
from app.services.scaffolding_engine import RequestType
from app.services.response_validator import ValidationResult


class TestValidationLogger:
    """Test suite for ValidationLogger."""

    def setup_method(self):
        """Set up test fixtures with temporary log file."""
        # Create temporary file for testing
        self.temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json')
        self.temp_file.close()
        self.logger = ValidationLogger(log_file=self.temp_file.name, max_entries=100)

    def teardown_method(self):
        """Clean up temporary files."""
        Path(self.temp_file.name).unlink(missing_ok=True)

    def test_initialization(self):
        """Test that logger initializes correctly."""
        assert self.logger.max_entries == 100
        assert self.logger.log_file == Path(self.temp_file.name)
        assert len(self.logger._logs) == 0

    def test_log_interaction_creates_entry(self):
        """Test that log_interaction creates a log entry."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1", "rule4"],
            rules_violated=[],
            code_line_count=2,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        self.logger.log_interaction(
            user_id="user123",
            request_type=RequestType.HINT,
            validation_result=validation_result,
            rules_applied=["rule1", "rule4"]
        )
        
        logs = self.logger.get_recent_logs()
        assert len(logs) == 1
        assert logs[0].user_id == "user123"
        assert logs[0].request_type == "hint"
        assert logs[0].validation_passed is True
        assert logs[0].rules_applied == ["rule1", "rule4"]

    def test_log_interaction_includes_all_fields(self):
        """Test that log entries include all required fields."""
        validation_result = ValidationResult(
            passed=False,
            request_type=RequestType.SOLUTION,
            rules_applied=["rule1", "rule2"],
            rules_violated=["rule1"],
            code_line_count=10,
            has_leading_question=False,
            is_complete_solution=True,
            confidence_score=0.3
        )
        
        self.logger.log_interaction(
            user_id="user456",
            request_type=RequestType.SOLUTION,
            validation_result=validation_result,
            rules_applied=["rule1", "rule2"]
        )
        
        logs = self.logger.get_recent_logs()
        entry = logs[0]
        
        assert entry.timestamp is not None
        assert entry.user_id == "user456"
        assert entry.request_type == "solution"
        assert entry.validation_passed is False
        assert entry.rules_applied == ["rule1", "rule2"]
        assert entry.rules_violated == ["rule1"]
        assert entry.code_line_count == 10
        assert entry.has_leading_question is False
        assert entry.is_complete_solution is True
        assert entry.confidence_score == 0.3

    def test_get_recent_logs_returns_newest_first(self):
        """Test that get_recent_logs returns entries in reverse chronological order."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        # Add multiple entries
        for i in range(5):
            self.logger.log_interaction(
                user_id=f"user{i}",
                request_type=RequestType.HINT,
                validation_result=validation_result,
                rules_applied=["rule1"]
            )
        
        logs = self.logger.get_recent_logs()
        
        # Most recent should be first
        assert logs[0].user_id == "user4"
        assert logs[1].user_id == "user3"
        assert logs[4].user_id == "user0"

    def test_get_recent_logs_respects_limit(self):
        """Test that get_recent_logs respects the limit parameter."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        # Add 10 entries
        for i in range(10):
            self.logger.log_interaction(
                user_id=f"user{i}",
                request_type=RequestType.HINT,
                validation_result=validation_result,
                rules_applied=["rule1"]
            )
        
        logs = self.logger.get_recent_logs(limit=5)
        assert len(logs) == 5

    def test_get_user_logs_filters_by_user(self):
        """Test that get_user_logs returns only logs for specified user."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        # Add entries for different users
        for i in range(5):
            self.logger.log_interaction(
                user_id="user_a",
                request_type=RequestType.HINT,
                validation_result=validation_result,
                rules_applied=["rule1"]
            )
        
        for i in range(3):
            self.logger.log_interaction(
                user_id="user_b",
                request_type=RequestType.HINT,
                validation_result=validation_result,
                rules_applied=["rule1"]
            )
        
        user_a_logs = self.logger.get_user_logs("user_a")
        user_b_logs = self.logger.get_user_logs("user_b")
        
        assert len(user_a_logs) == 5
        assert len(user_b_logs) == 3
        assert all(log.user_id == "user_a" for log in user_a_logs)
        assert all(log.user_id == "user_b" for log in user_b_logs)

    def test_log_size_bounded_at_max_entries(self):
        """Test that log size is bounded at max_entries."""
        # Create logger with small max_entries
        small_logger = ValidationLogger(log_file=self.temp_file.name, max_entries=10)
        
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        # Add more entries than max_entries
        for i in range(15):
            small_logger.log_interaction(
                user_id=f"user{i}",
                request_type=RequestType.HINT,
                validation_result=validation_result,
                rules_applied=["rule1"]
            )
        
        logs = small_logger.get_recent_logs()
        
        # Should only have max_entries
        assert len(logs) == 10
        
        # Should have the most recent entries (user5 through user14)
        assert logs[0].user_id == "user14"
        assert logs[9].user_id == "user5"

    def test_logs_persist_to_file(self):
        """Test that logs are persisted to JSON file."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        self.logger.log_interaction(
            user_id="user123",
            request_type=RequestType.HINT,
            validation_result=validation_result,
            rules_applied=["rule1"]
        )
        
        # Check that file exists and contains data
        assert Path(self.temp_file.name).exists()
        
        with open(self.temp_file.name, 'r') as f:
            data = json.load(f)
            assert len(data) == 1
            assert data[0]["user_id"] == "user123"

    def test_logs_load_from_file(self):
        """Test that logs are loaded from file on initialization."""
        validation_result = ValidationResult(
            passed=True,
            request_type=RequestType.HINT,
            rules_applied=["rule1"],
            rules_violated=[],
            code_line_count=1,
            has_leading_question=True,
            is_complete_solution=False,
            confidence_score=0.9
        )
        
        # Add entries and save
        self.logger.log_interaction(
            user_id="user123",
            request_type=RequestType.HINT,
            validation_result=validation_result,
            rules_applied=["rule1"]
        )
        
        # Create new logger instance with same file
        new_logger = ValidationLogger(log_file=self.temp_file.name)
        logs = new_logger.get_recent_logs()
        
        assert len(logs) == 1
        assert logs[0].user_id == "user123"

    def test_corrupted_file_starts_fresh(self):
        """Test that corrupted log file results in fresh start."""
        # Write corrupted JSON to file
        with open(self.temp_file.name, 'w') as f:
            f.write("{ invalid json }")
        
        # Should not crash, should start fresh
        logger = ValidationLogger(log_file=self.temp_file.name)
        logs = logger.get_recent_logs()
        
        assert len(logs) == 0

    def test_default_log_file_path(self):
        """Test that default log file path is in data directory."""
        logger = ValidationLogger()
        
        assert "data" in str(logger.log_file)
        assert logger.log_file.name == "validation_logs.json"
