"""Script to migrate data from JSON to SQLite database"""
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.database import SessionLocal, engine, Base
from app.models.models import Course, Mission, Achievement, LeaderboardEntry, Post


def load_json_data():
    """Load data from db.json"""
    data_file = Path(__file__).parent / "data" / "db.json"
    with open(data_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def migrate_courses(db, courses_data):
    """Migrate courses to database"""
    print("Migrating courses...")
    for course in courses_data:
        db_course = Course(
            id=course['id'],
            title=course['title'],
            description=course['description'],
            progress=course.get('progress', 0),
            total_lessons=course.get('totalLessons', 0),
            icon=course.get('icon'),
            color=course.get('color'),
            difficulty=course.get('difficulty'),
            stars=course.get('stars', 0),
            is_boss=course.get('isBoss', False),
            locked=course.get('locked', False)
        )
        db.add(db_course)
    db.commit()
    print(f"✓ Migrated {len(courses_data)} courses")


def migrate_missions(db, missions_data):
    """Migrate missions to database"""
    print("Migrating missions...")
    for mission in missions_data:
        db_mission = Mission(
            id=mission['id'],
            title=mission['title'],
            chapter=mission.get('chapter'),
            description=mission.get('description'),
            difficulty=mission.get('difficulty'),
            xp_reward=mission.get('xpReward', 0),
            objectives=mission.get('objectives', []),
            starter_code=mission.get('starterCode'),
            test_cases=mission.get('testCases', []),
            hints=mission.get('hints', [])
        )
        db.add(db_mission)
    db.commit()
    print(f"✓ Migrated {len(missions_data)} missions")


def migrate_achievements(db, achievements_data):
    """Migrate achievements to database"""
    print("Migrating achievements...")
    for achievement in achievements_data:
        db_achievement = Achievement(
            id=achievement['id'],
            title=achievement['title'],
            description=achievement.get('description'),
            icon=achievement.get('icon'),
            rarity=achievement.get('rarity'),
            progress=achievement.get('progress', 0),
            total=achievement.get('total', 1),
            unlocked=achievement.get('unlocked', False),
            category=achievement.get('category')
        )
        db.add(db_achievement)
    db.commit()
    print(f"✓ Migrated {len(achievements_data)} achievements")


def migrate_leaderboard(db, leaderboard_data):
    """Migrate leaderboard to database"""
    print("Migrating leaderboard...")
    for entry in leaderboard_data:
        db_entry = LeaderboardEntry(
            rank=entry['rank'],
            name=entry['name'],
            avatar=entry.get('avatar'),
            xp=entry.get('xp', 0),
            level=entry.get('level', 1),
            badge=entry.get('badge'),
            school=entry.get('school'),
            scope="global"
        )
        db.add(db_entry)
    db.commit()
    print(f"✓ Migrated {len(leaderboard_data)} leaderboard entries")


def migrate_posts(db, posts_data):
    """Migrate posts to database"""
    print("Migrating posts...")
    for post in posts_data:
        author = post.get('author', {})
        db_post = Post(
            id=post['id'],
            author_name=author.get('name', 'Unknown'),
            author_avatar=author.get('avatar'),
            author_level=author.get('level', 1),
            time=post.get('time', ''),
            content=post.get('content', ''),
            tags=post.get('tags', []),
            likes=post.get('likes', 0),
            comments=post.get('comments', 0),
            liked=post.get('liked', False),
            code=post.get('code')
        )
        db.add(db_post)
    db.commit()
    print(f"✓ Migrated {len(posts_data)} posts")


def main():
    """Main migration function"""
    print("=" * 50)
    print("PyPath: JSON to SQLite Migration")
    print("=" * 50)
    
    # Load JSON data
    print("\nLoading JSON data...")
    data = load_json_data()
    print("✓ JSON data loaded")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Migrate data
        migrate_courses(db, data.get('courses', []))
        migrate_missions(db, data.get('missions', []))
        migrate_achievements(db, data.get('achievements', []))
        migrate_leaderboard(db, data.get('leaderboard', []))
        migrate_posts(db, data.get('posts', []))
        
        print("\n" + "=" * 50)
        print("✓ Migration completed successfully!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
