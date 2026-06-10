from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Preferences, ConsideredSet, CandidateInteraction, Conversation
from security import get_current_user
import uuid

from nis.services.nis_matchmaking_service import NISMatchmakingService
from nis.adapters.db_to_nis_mapper import (
    map_db_user_to_user_profile, 
    map_db_candidate_to_candidate_profile, 
    map_db_preference_to_match_preference
)
from nis.models.candidate_pool_context import CandidatePoolContext
from nis.models.mutual_interest_state import MutualInterestState
from nis.engines.mutual_interest_gate_engine import evaluate_mutual_interest_gate

router = APIRouter(prefix="/sakinah", tags=["Matchmaking"])

@router.post("/matches/generate")
def generate_matches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch current user (Already verified by JWT!)
    seeker = current_user
    user_id = seeker.id
        
    # 2. Build NIS Dictionaries
    user_dict = {
        "user_id": seeker.id, "name": seeker.full_name, "age": seeker.age, "gender": seeker.gender,
        "location": seeker.city, "education_level": seeker.education, "occupation": seeker.occupation,
        "is_verified": seeker.kyc_status == "verified", "is_banned": seeker.is_banned,
        "safety_status": seeker.safety_status, "has_required_data": True,
        "communication_style": "Calm", "tradition": "Sunni"
    }
    
    db_pref = seeker.preferences
    pref_dict = {}
    if db_pref:
        pref_dict = {
            "preferred_min_age": db_pref.preferred_age_min, "preferred_max_age": db_pref.preferred_age_max,
            "preferred_locations": [db_pref.preferred_city] if db_pref.preferred_city else [],
            "preferred_education_levels": [db_pref.preferred_education] if db_pref.preferred_education else [],
        }
        
    # 3. Fetch Candidate Pool
    other_users = db.query(User).filter(
        User.id != user_id, 
        User.gender != seeker.gender,
        User.is_banned == False,
        User.kyc_status == "verified",
        User.safety_status == "CLEAR"
    ).all()
    
    candidate_dicts = []
    for u in other_users:
        candidate_dicts.append({
            "candidate_id": u.id,
            "profile": {
                "user_id": u.id, "name": u.full_name, "age": u.age, "gender": u.gender,
                "location": u.city, "education_level": u.education, "occupation": u.occupation,
                "is_verified": True, "is_banned": False, "safety_status": "CLEAR", "has_required_data": True,
                "communication_style": "Calm", "tradition": "Sunni", "marriage_readiness": "READY"
            }
        })

    # 4. Map Dictionaries to NIS Objects
    nis_user = map_db_user_to_user_profile(user_dict)
    nis_pref = map_db_preference_to_match_preference(pref_dict)
    nis_candidates = [map_db_candidate_to_candidate_profile(c) for c in candidate_dicts]

    # 5. Build CandidatePoolContext
    active_convos = db.query(Conversation).filter(
        (Conversation.seeker_a_id == user_id) | (Conversation.seeker_b_id == user_id),
        Conversation.status == "ACTIVE"
    ).all()
    active_convos_count = len(active_convos)
    
    active_convo_candidate_ids = []
    for c in active_convos:
        active_convo_candidate_ids.append(c.seeker_b_id if c.seeker_a_id == user_id else c.seeker_a_id)

    interactions = db.query(CandidateInteraction).filter(CandidateInteraction.seeker_id == user_id).all()
    shown_ids = [i.candidate_id for i in interactions if i.status == "SHOWN"]
    passed_ids = [i.candidate_id for i in interactions if i.status == "PASS"]
    
    pool_context = CandidatePoolContext(
        seeker_id=user_id,
        active_conversations_count=active_convos_count,
        max_active_conversations=2,
        shown_candidate_ids=shown_ids,
        passed_candidate_ids=passed_ids,
        blocked_candidate_ids=[],
        active_conversation_candidate_ids=active_convo_candidate_ids,
        max_considered_candidates=3
    )

    # 6. Execute NIS
    result = NISMatchmakingService.generate_considered_few(
        current_user=nis_user,
        match_preference=nis_pref,
        candidates=nis_candidates,
        pool_context=pool_context
    )
    
    # 7. Store Result safely
    if result.get("status") == "HAS_CONSIDERED_CANDIDATES":
        c_set_id = str(uuid.uuid4())
        candidate_ids = [c["candidate_id"] for c in result.get("candidates", [])]
        
        c_set = ConsideredSet(
            considered_set_id=c_set_id, seeker_id=user_id,
            candidate_ids=candidate_ids, nis_status=result.get("status")
        )
        db.add(c_set)
        
        for cid in candidate_ids:
            interaction = CandidateInteraction(
                seeker_id=user_id, candidate_id=cid, 
                status="SHOWN", considered_set_id=c_set_id
            )
            db.add(interaction)
        db.commit()

    return result

@router.post("/candidates/{candidate_id}/pass")
def pass_candidate(candidate_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    interaction = CandidateInteraction(
        seeker_id=user_id, candidate_id=candidate_id, status="PASS"
    )
    db.add(interaction)
    db.commit()
    return {"status": "success", "message": "Candidate passed silently."}

@router.post("/candidates/{candidate_id}/interest")
def express_interest(candidate_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    interaction = CandidateInteraction(
        seeker_id=user_id, candidate_id=candidate_id, status="INTEREST"
    )
    db.add(interaction)
    db.commit()
    return {"status": "success", "message": "Interest recorded privately."}

@router.post("/mutual-interest/evaluate")
def evaluate_mutual_interest(candidate_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    seeker_interest = db.query(CandidateInteraction).filter_by(seeker_id=user_id, candidate_id=candidate_id, status="INTEREST").first()
    candidate_interest = db.query(CandidateInteraction).filter_by(seeker_id=candidate_id, candidate_id=user_id, status="INTEREST").first()
    seeker_pass = db.query(CandidateInteraction).filter_by(seeker_id=user_id, candidate_id=candidate_id, status="PASS").first()
    candidate_pass = db.query(CandidateInteraction).filter_by(seeker_id=candidate_id, candidate_id=user_id, status="PASS").first()
    
    state = MutualInterestState(
        seeker_id=user_id, candidate_id=candidate_id,
        seeker_interested=bool(seeker_interest), candidate_interested=bool(candidate_interest),
        seeker_passed=bool(seeker_pass), candidate_passed=bool(candidate_pass)
    )
    
    gate_result = evaluate_mutual_interest_gate(state)
    
    if gate_result.get("status") == "MUTUAL_INTEREST_CONFIRMED":
        existing = db.query(Conversation).filter(
            ((Conversation.seeker_a_id == user_id) & (Conversation.seeker_b_id == candidate_id)) |
            ((Conversation.seeker_a_id == candidate_id) & (Conversation.seeker_b_id == user_id))
        ).first()
        if not existing:
            new_convo = Conversation(
                conversation_id=str(uuid.uuid4()), seeker_a_id=user_id, seeker_b_id=candidate_id
            )
            db.add(new_convo)
            db.commit()
            
    return {"status": gate_result.get("status")}
