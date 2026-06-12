<<<<<<< HEAD
# sakinah
=======
# Sakinahh Backend API

## Overview

Sakinahh is a halal-first Islamic matchmaking platform with an advanced NIS (Neural Islamic Scoring) engine that prioritizes safety, psychology-based compatibility, and Islamic values.

## Technology Stack

- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL / SQLite (local)
- **Authentication**: JWT tokens
- **ORM**: SQLAlchemy 2.0+

## Core Features

### 1. KYC Verification
- Document verification (ID, Passport, etc.)
- Selfie verification
- Verification score tracking
- Safety status management

### 2. Matchmaking Engine
- Advanced NIS (Neural Islamic Scoring) system
- Psychology-based compatibility
- Multi-layered filtering (religious, safety, preference)
- Vulnerability protection algorithms

### 3. User Management
- Profile setup and management
- Religious details tracking
- Psychological profile assessment
- Preference configuration

### 4. Safety & Security
- Harassment prevention
- Vulnerability protection
- Human review triggers for high-risk patterns
- Banned user detection

## Backend-Safe NIS Response Contract

### Privacy Safe Response Format

All NIS responses follow strict privacy and safety contracts:

```json
{
  "meta": {
    "generated_at": "2026-06-11T10:30:00Z",
    "privacy_safe": true,
    "exposed_metrics": ["basic_compatibility_tier"]
  },
  "candidates": [
    {
      "candidate_id": 123,
      "basic_tier": "HIGH_COMPATIBILITY",
      "match_reason_category": "shared_values"
    }
  ]
}
```

### Security Principles

1. **No Private Scores Exposed**
   - Internal scoring algorithms never shown to users
   - Only compatibility tiers displayed (HIGH/MODERATE/LOW)
   - No percentage scores exposed

2. **No Rejection Details**
   - Specific rejection reasons never shown
   - Only generic "not a match" messages
   - No information about disqualifying factors

3. **No Psychological Profiling Data**
   - Raw psychological assessment responses never exposed
   - Safety risk indicators never shared
   - Personal boundary data confidential

4. **Active Conversation Limits**
   - Prevents overwhelming users
   - Protects from conversion-rate gaming
   - Maintains quality interactions

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Profile
- `POST /profile/setup` - Setup user profile
- `GET /profile/me` - Get current user profile
- `PUT /profile/update` - Update profile

### Matching
- `POST /matches/generate` - Generate match candidates
- `POST /matches/pass` - Pass on a candidate

### KYC
- `POST /kyc/upload` - Upload KYC documents
- `GET /kyc/status` - Check verification status

## Database Models

### User
- Basic profile (name, email, age, gender, location)
- KYC status and verification
- Safety status
- Religious details
- Preferences
- Psychological profile

### Preferences
- Age range preferences
- Location preferences
- Religious practice level
- Marital status preferences
- Education/occupation preferences
- Family involvement preferences

### PsychologicalProfile
- Communication style
- Attachment style
- Marriage readiness
- Conflict resolution
- Financial expectations
- Emotional steadiness
- Safety assessment fields

## Testing

Run all tests:
```bash
pytest -v
```

Run specific test suite:
```bash
pytest tests/test_nis_engine.py -v
```

Test coverage includes:
- ✅ 150+ passing tests
- API safety contract validation
- KYC verification gates
- NIS engine matching logic
- Vulnerability protection
- Psychological signal parsing

## Development

### Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Run Server

```bash
uvicorn main:app --reload
```

### Environment Variables

Create `.env` file:
```
DATABASE_URL=sqlite:///./test.db
JWT_SECRET_KEY=your-secret-key-here
```

## Deployment

Backend is production-ready with:
- Full test coverage for critical paths
- Privacy and security contracts enforced
- Error handling and validation
- Database migrations support
>>>>>>> 4f35b35 (Initial backend deployment)
