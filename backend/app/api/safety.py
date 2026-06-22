from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.core.security import get_current_user
from app.core.firebase import get_db
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

SAKINAH_BAN_THRESHOLD = 5


class ReportPayload(BaseModel):
    reason: str
    details: str
    evidence_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Evidence-based report (JSON) — used by report/{uid} direct route
# ---------------------------------------------------------------------------
@router.post("/report/{reported_uid}")
async def report_user(
    reported_uid: str,
    payload: ReportPayload,
    current_user: dict = Depends(get_current_user)
):
    """
    Report a user with digital evidence and details.
    Reports are stored as a subcollection under the reported user's profile.
    At 5+ unique reporters the user is temporarily suspended pending admin review.
    """
    reporter_uid = current_user.get("uid")

    if reporter_uid == reported_uid:
        raise HTTPException(status_code=400, detail="You cannot report yourself.")

    db = get_db()

    reported_doc_ref = db.collection("profiles").document(reported_uid)
    if not reported_doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Reported user not found.")

    reports_ref = reported_doc_ref.collection("reports")
    if reports_ref.document(reporter_uid).get().exists:
        return {"status": "already_reported", "message": "You have already reported this user."}

    reports_ref.document(reporter_uid).set({
        "reporter_id": reporter_uid,
        "reason": payload.reason,
        "details": payload.details,
        "evidence_url": payload.evidence_url,
        "reported_at": datetime.utcnow().isoformat()
    })

    report_count = len(reports_ref.get())

    if report_count >= SAKINAH_BAN_THRESHOLD:
        reported_doc_ref.set(
            {
                "sakinah_banned": True,
                "sakinah_banned_at": datetime.utcnow().isoformat(),
                "sakinah_ban_reason": "Temporarily banned pending admin review due to 5+ reports"
            },
            merge=True
        )
        return {"status": "reported", "message": "Report submitted. This user has been temporarily suspended pending admin review."}

    return {"status": "reported", "message": f"Report submitted. ({report_count}/{SAKINAH_BAN_THRESHOLD} unique reports)"}


# ---------------------------------------------------------------------------
# Multipart evidence report — used by frontend submitEvidenceReport()
# POST /moderation/reports  (FormData with optional file attachment)
# ---------------------------------------------------------------------------
@router.post("/moderation/reports")
async def submit_evidence_report(
    reported_user_id: str = Form(...),
    reason: str = Form(...),
    description: str = Form(""),
    additional_notes: str = Form(""),
    evidence_file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Accept a multipart evidence report from the frontend.
    File uploads are stored as metadata (actual Firebase Storage upload
    should happen client-side; this records the report in Firestore).
    """
    reporter_uid = current_user.get("uid")

    if reporter_uid == reported_user_id:
        raise HTTPException(status_code=400, detail="You cannot report yourself.")

    db = get_db()

    reported_doc_ref = db.collection("profiles").document(reported_user_id)
    reports_ref = reported_doc_ref.collection("reports")

    if reports_ref.document(reporter_uid).get().exists:
        return {"status": "already_reported", "message": "You have already reported this user."}

    evidence_filename = evidence_file.filename if evidence_file else None

    reports_ref.document(reporter_uid).set({
        "reporter_id": reporter_uid,
        "reason": reason,
        "details": description,
        "additional_notes": additional_notes,
        "evidence_filename": evidence_filename,
        "reported_at": datetime.utcnow().isoformat()
    })

    report_count = len(reports_ref.get())

    if report_count >= SAKINAH_BAN_THRESHOLD:
        reported_doc_ref.set(
            {
                "sakinah_banned": True,
                "sakinah_banned_at": datetime.utcnow().isoformat(),
                "sakinah_ban_reason": "Temporarily banned pending admin review due to 5+ reports"
            },
            merge=True
        )

    return {"status": "reported", "message": f"Report submitted. ({report_count}/{SAKINAH_BAN_THRESHOLD})"}


# ---------------------------------------------------------------------------
# Report status — admin/internal use
# ---------------------------------------------------------------------------
@router.get("/report-status/{reported_uid}")
async def get_report_status(
    reported_uid: str,
    current_user: dict = Depends(get_current_user)
):
    reporter_uid = current_user.get("uid")
    db = get_db()

    reported_doc_ref = db.collection("profiles").document(reported_uid)
    reports_ref = reported_doc_ref.collection("reports")

    already_reported = reports_ref.document(reporter_uid).get().exists
    unique_count = len(reports_ref.get())

    reported_profile = reported_doc_ref.get()
    is_banned, ban_reason = False, None
    if reported_profile.exists:
        data = reported_profile.to_dict()
        is_banned = data.get("sakinah_banned", False)
        ban_reason = data.get("sakinah_ban_reason")

    return {
        "you_have_reported": already_reported,
        "unique_report_count": unique_count,
        "threshold": SAKINAH_BAN_THRESHOLD,
        "sakinah_banned": is_banned,
        "ban_reason": ban_reason
    }


# ---------------------------------------------------------------------------
# Analytics Summary — dashboard sidebar counts
# ---------------------------------------------------------------------------
@router.get("/analytics/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()

    # Count interests received
    interests_recv = db.collection("candidate_interactions").where("candidate_id", "==", uid).where("status", "==", "INTEREST").get()
    # Count interests sent
    interests_sent = db.collection("candidate_interactions").where("seeker_id", "==", uid).where("status", "==", "INTEREST").get()
    
    # Count active conversations (messages)
    convs_a = db.collection("conversations").where("seeker_a_id", "==", uid).where("status", "==", "ACTIVE").get()
    convs_b = db.collection("conversations").where("seeker_b_id", "==", uid).where("status", "==", "ACTIVE").get()

    # Count saved profiles
    saved_docs = db.collection("saved_profiles").where("seeker_id", "==", uid).get()

    return {
        "totalViews": 0,        # Profile views — requires view tracking (future)
        "interests": len(interests_recv) + len(interests_sent),
        "messages": len(list(convs_a) + list(convs_b)),
        "saved": len(saved_docs)
    }


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------
@router.get("/notifications/me")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()

    notifs = db.collection("notifications").where("user_id", "==", uid).order_by("created_at").get()
    return [doc.to_dict() for doc in notifs]


# ---------------------------------------------------------------------------
# Trust Score
# ---------------------------------------------------------------------------
@router.get("/trust-score/me")
async def get_trust_score(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()

    profile_doc = db.collection("profiles").document(uid).get()
    if not profile_doc.exists:
        return {"trust_score": 0, "level": "UNVERIFIED"}

    data = profile_doc.to_dict()
    kyc_verified = data.get("kyc_verified", False)
    liveness_verified = data.get("liveness_verified", False)

    # Get email from users collection (not stored on profile)
    user_doc = db.collection("users").document(uid).get()
    email = user_doc.to_dict().get("email", "") if user_doc.exists else ""

    score = 0
    if kyc_verified: score += 40
    if liveness_verified: score += 40
    if email: score += 20          # email always present after registration

    level = "VERIFIED" if score >= 100 else ("PARTIAL" if score > 0 else "UNVERIFIED")

    return {
        "score": score,
        "level": level,
        "factors": {
            "kycCompletion": kyc_verified,
            "identityVerification": liveness_verified,
            "emailVerification": bool(email),
            "phoneVerification": False,  # Phone not collected — always false for now
        }
    }


# ---------------------------------------------------------------------------
# Wali (Guardian) Verification
# ---------------------------------------------------------------------------
class WaliVerifyPayload(BaseModel):
    email: str

@router.post("/wali/verify")
async def verify_wali(payload: WaliVerifyPayload):
    """
    Verify wali (guardian) email against stored wali data.
    No auth required — wali logs in with their own email.
    """
    db = get_db()

    from app.api.auth import create_access_token
    from datetime import timedelta

    profiles = db.collection("profiles").where("wali_email", "==", payload.email.lower()).get()

    if not profiles:
        raise HTTPException(status_code=401, detail="Unauthorized: No seeker linked to this email.")

    seeker_uid = profiles[0].id
    
    # create_access_token in auth.py expects a dictionary payload, not expires_delta
    token_payload = {
        "uid": seeker_uid,
        "email": payload.email.lower()
    }
    access_token = create_access_token(token_payload)

    return {
        "success": True,
        "token": access_token,
        "access_token": access_token
    }


class WaliNotifyPayload(BaseModel):
    event: str
    message: str
    email: str
    timestamp: Optional[str] = None

@router.post("/wali/notify")
async def notify_wali_login(payload: WaliNotifyPayload, current_user: dict = Depends(get_current_user)):
    """Record a wali login notification so the seeker can see it."""
    uid = current_user.get("uid")
    db = get_db()

    db.collection("notifications").add({
        "user_id": uid,
        "type": payload.event,
        "message": payload.message,
        "wali_email": payload.email,
        "created_at": payload.timestamp or datetime.utcnow().isoformat(),
        "read": False
    })

    return {"status": "notified"}


# ---------------------------------------------------------------------------
# Photo Access (stub — actual photos stored in Firebase Storage client-side)
# ---------------------------------------------------------------------------
@router.post("/photos/access-log")
async def log_photo_access(payload: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.collection("photo_access_logs").add({
        **payload,
        "logged_at": datetime.utcnow().isoformat()
    })
    return {"status": "logged"}

@router.post("/photos/permissions/grant")
async def grant_photo_access(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    target = payload.get("target_user_id")
    db.collection("photo_permissions").document(f"{uid}_{target}").set({
        "granter_id": uid, "receiver_id": target, "granted": True,
        "granted_at": datetime.utcnow().isoformat()
    })
    return {"status": "granted"}

@router.post("/photos/permissions/revoke")
async def revoke_photo_access(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    target = payload.get("target_user_id")
    db.collection("photo_permissions").document(f"{uid}_{target}").set({
        "granter_id": uid, "receiver_id": target, "granted": False,
        "revoked_at": datetime.utcnow().isoformat()
    }, merge=True)
    return {"status": "revoked"}

@router.get("/photos/requests")
async def get_photo_requests(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    requests = db.collection("photo_permissions").where("receiver_id", "==", uid).get()
    return [doc.to_dict() for doc in requests]


# ---------------------------------------------------------------------------
# Family / Wali Member Management
# ---------------------------------------------------------------------------
class FamilyInvitePayload(BaseModel):
    name: str
    email: str
    role: str

@router.post("/family/invite")
async def invite_family_member(payload: FamilyInvitePayload, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    member_id = f"{uid}_{payload.email.replace('@','_').replace('.','_')}"
    db.collection("family_members").document(member_id).set({
        "seeker_id": uid,
        "name": payload.name,
        "email": payload.email.lower(),
        "role": payload.role,
        "invited_at": datetime.utcnow().isoformat(),
        "status": "PENDING"
    })
    # Store wali email on profile for wali/verify lookup
    if payload.role.upper() in ("WALI", "GUARDIAN"):
        db.collection("profiles").document(uid).set(
            {"wali_email": payload.email.lower()}, merge=True
        )
    return {"status": "invited", "member_id": member_id}

@router.get("/family/members")
async def get_family_members(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    members = db.collection("family_members").where("seeker_id", "==", uid).get()
    return [{"id": doc.id, **doc.to_dict()} for doc in members]

@router.delete("/family/members/{member_id}")
async def remove_family_member(member_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    db.collection("family_members").document(member_id).delete()
    return {"status": "removed"}


# ---------------------------------------------------------------------------
# Profile Sharing
# ---------------------------------------------------------------------------
@router.post("/profile/share")
async def share_profile(payload: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    db.collection("profile_shares").add({
        "sharer_id": uid,
        "target_user_id": payload.get("target_user_id"),
        "platform": payload.get("platform"),
        "shared_at": payload.get("timestamp", datetime.utcnow().isoformat())
    })
    return {"status": "shared"}


# ---------------------------------------------------------------------------
# Analytics — Profile Views (stub)
# ---------------------------------------------------------------------------
@router.get("/analytics/profile-views")
async def get_profile_views(current_user: dict = Depends(get_current_user)):
    return {"total_views": 0, "message": "Profile view tracking coming soon."}


# ---------------------------------------------------------------------------
# Dev proof report (dev only stub)
# ---------------------------------------------------------------------------
@router.get("/dev/proof-report")
async def dev_proof_report(current_user: dict = Depends(get_current_user)):
    return {
        "status": "ok",
        "backend": "FastAPI",
        "nis_engine": "connected",
        "database": "Firestore",
        "auth": "JWT + Firebase"
    }
