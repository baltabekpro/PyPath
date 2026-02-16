from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any


class JsonRepository:
    def __init__(self, data_file: Path) -> None:
        self.data_file = data_file
        self._lock = Lock()

    def load(self) -> dict[str, Any]:
        if not self.data_file.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_file}")
        with self.data_file.open("r", encoding="utf-8") as file:
            return json.load(file)

    def save(self, data: dict[str, Any]) -> None:
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        with self.data_file.open("w", encoding="utf-8") as file:
            json.dump(data, file, ensure_ascii=False, indent=2)

    def read_section(self, section: str) -> Any:
        db = self.load()
        return db.get(section)

    def update_db(self, updater):
        with self._lock:
            db = self.load()
            result = updater(db)
            self.save(db)
            return result
