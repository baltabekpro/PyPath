"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

Base = declarative_base()

_engine = None
_SessionLocal = None


def _get_engine():
    """Get or create the database engine (lazy initialization)."""
    global _engine
    if _engine is None:
        url = get_settings().database_url
        kwargs = {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {}
        _engine = create_engine(url, **kwargs)
    return _engine


def _get_session_factory():
    """Get or create the session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_get_engine())
    return _SessionLocal


# Module-level aliases kept for backwards compatibility with imports like
# ``from app.core.database import engine`` or ``SessionLocal``.
# They resolve lazily on first attribute access via this module.
def __getattr__(name: str):
    if name == "engine":
        return _get_engine()
    if name == "SessionLocal":
        return _get_session_factory()
    raise AttributeError(name)


def init_db() -> None:
    """Create all tables if they do not exist yet.

    Safe to call repeatedly (CREATE TABLE IF NOT EXISTS semantics).
    Should be called during application startup.
    """
    import app.models.models  # noqa: F401 – ensure models are registered on Base
    Base.metadata.create_all(bind=_get_engine())


def reset_engine() -> None:
    """Discard cached engine and session factory.

    Intended for use in tests so that a freshly-set DATABASE_URL env-var
    takes effect when the next request creates a new session.
    """
    global _engine, _SessionLocal
    _engine = None
    _SessionLocal = None


def get_db():
    """Dependency to get database session"""
    db = _get_session_factory()()
    try:
        yield db
    finally:
        db.close()
