"""SQLAlchemy database models"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String)
    bio = Column(Text)
    level = Column(String, default="Новичок")
    level_num = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    max_xp = Column(Integer, default=100)
    streak = Column(Integer, default=0)
    rank = Column(Integer, default=0)
    league = Column(String, default="Bronze")
    settings = Column(JSON, default={"theme": "dark", "notifications": True, "sound": True})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String, nullable=False)
    author_avatar = Column(String)
    author_level = Column(Integer, default=1)
    time = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, default=[])
    likes = Column(Integer, default=0)
    comments = Column(Integer, default=0)
    liked = Column(Boolean, default=False)
    code = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    progress = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    icon = Column(String)
    color = Column(String)
    difficulty = Column(String)
    stars = Column(Integer, default=0)
    is_boss = Column(Boolean, default=False)
    locked = Column(Boolean, default=False)


class Mission(Base):
    __tablename__ = "missions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    chapter = Column(String)
    description = Column(Text)
    difficulty = Column(String)
    xp_reward = Column(Integer, default=0)
    objectives = Column(JSON, default=[])
    starter_code = Column(Text)
    test_cases = Column(JSON, default=[])
    hints = Column(JSON, default=[])


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    icon = Column(String)
    rarity = Column(String)
    progress = Column(Integer, default=0)
    total = Column(Integer, default=1)
    unlocked = Column(Boolean, default=False)
    category = Column(String)


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    rank = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    avatar = Column(String)
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    badge = Column(String, nullable=True)
    school = Column(String, nullable=True)
    scope = Column(String, default="global")  # global, friends, school
