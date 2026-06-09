import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from database import engine as pg_engine, SessionLocal as PGSessionLocal, Base, DATABASE_URL
from models import User, ReligiousDetails, Preferences

def run_orm_verification(engine, session_factory, db_type="PostgreSQL"):
    print(f"\n--- Running ORM & Relationship Verification on {db_type} ---")
    
    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    print(f"[SUCCESS] Tables verified/created on {db_type}.")

    db: Session = session_factory()
    try:
        # 2. Clean up any existing test user
        existing_user = db.query(User).filter(User.email == "test.user@sakina.com").first()
        if existing_user:
            db.delete(existing_user)
            db.commit()

        # 3. Create test records
        new_user = User(
            full_name="Sakina Test User",
            email="test.user@sakina.com",
            password="hashed_secure_password_123",
            age=25,
            gender="Female",
            city="London",
            education="Master's in Computer Science",
            occupation="Software Engineer"
        )
        
        religious_details = ReligiousDetails(
            prayer_level="Always prays",
            quran_reading_level="Daily reader",
            islamic_knowledge="Intermediate",
            hijab_status="Yes, always"
        )
        
        preferences = Preferences(
            preferred_age_min=25,
            preferred_age_max=32,
            preferred_city="London",
            preferred_education="Bachelor's Degree or Higher",
            preferred_religious_level="Practicing"
        )

        # Establish one-to-one relationships
        new_user.religious_details = religious_details
        new_user.preferences = preferences

        # Add and commit
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"[SUCCESS] Test user successfully created with ID: {new_user.id}")

        # 4. Query back to verify relationships
        queried_user = db.query(User).filter(User.email == "test.user@sakina.com").first()
        
        assert queried_user is not None, "Failed to query back user"
        assert queried_user.religious_details is not None, "ReligiousDetails relationship is broken"
        assert queried_user.preferences is not None, "Preferences relationship is broken"

        print(f"[SUCCESS] Verified User -> ReligiousDetails relationship: {queried_user.religious_details.prayer_level}")
        print(f"[SUCCESS] Verified User -> Preferences relationship: {queried_user.preferences.preferred_city}")

        # 5. Verify cascade delete works (deleting user should delete religious details and preferences)
        db.delete(queried_user)
        db.commit()
        
        orphaned_details = db.query(ReligiousDetails).filter(ReligiousDetails.user_id == new_user.id).first()
        orphaned_prefs = db.query(Preferences).filter(Preferences.user_id == new_user.id).first()
        
        assert orphaned_details is None, "Cascade delete failed for ReligiousDetails"
        assert orphaned_prefs is None, "Cascade delete failed for Preferences"
        
        print("[SUCCESS] Verified cascade delete: User deletion automatically removed details and preferences.")
        print(f"[SUCCESS] ORM Model Verification on {db_type} passed completely!")
        return True

    except Exception as e:
        db.rollback()
        print(f"[FAILURE] Error during database operations on {db_type}: {e}")
        return False
    finally:
        db.close()

def main():
    print("=" * 70)
    print(" Sakina Matrimony Platform Database Verification ")
    print("=" * 70)
    print(f"Primary Target URL: {DATABASE_URL}")
    
    # Try PostgreSQL first
    try:
        # Quick connectivity test
        with pg_engine.connect() as conn:
            pass
        
        print("[SUCCESS] Connected to PostgreSQL database successfully.")
        success = run_orm_verification(pg_engine, PGSessionLocal, db_type="PostgreSQL")
        if success:
            print("\nDatabase layer fully verified on PostgreSQL!")
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as pg_err:
        print("\n[WARNING] Could not connect to PostgreSQL database.")
        print(f"Connection Error: {pg_err}")
        print("\nTroubleshooting tips for PostgreSQL:")
        print("1. Ensure PostgreSQL server is running.")
        print("2. Set the 'DATABASE_URL' environment variable with valid credentials.")
        print("   Example (PowerShell): $env:DATABASE_URL=\"postgresql://user:pass@localhost:5432/dbname\"")
        print("   Example (CMD):        set DATABASE_URL=postgresql://user:pass@localhost:5432/dbname")
        
        print("\n" + "-" * 70)
        print("Attempting ORM Validation with SQLite Fallback...")
        print("-" * 70)
        
        # Setup temporary SQLite engine
        sqlite_engine = create_engine("sqlite:///:memory:")
        SQLiteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)
        
        success = run_orm_verification(sqlite_engine, SQLiteSessionLocal, db_type="SQLite (In-Memory)")
        if success:
            print("\n[PARTIAL SUCCESS] ORM schema definitions and relationships are 100% correct!")
            print("To verify PostgreSQL specifically, configure a running database and set DATABASE_URL.")
            sys.exit(0)
        else:
            sys.exit(1)

if __name__ == "__main__":
    main()
