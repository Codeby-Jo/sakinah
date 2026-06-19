from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.core.firebase import get_db
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter()

class SendMessageRequest(BaseModel):
    text: str
    msg_type: str = "text"  # text | system | image | video

@router.get("/")
async def get_my_conversations(current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    db = get_db()
    
    # Query conversations where current user is seeker_a or seeker_b
    # Firestore does not support logical OR in where directly across fields easily unless we query twice or use a users array
    # Let's query where seeker_a_id == uid
    convs_a = db.collection("conversations").where("seeker_a_id", "==", uid).where("status", "==", "ACTIVE").get()
    convs_b = db.collection("conversations").where("seeker_b_id", "==", uid).where("status", "==", "ACTIVE").get()
    
    convs_all = list(convs_a) + list(convs_b)
    
    result = []
    for doc in convs_all:
        c = doc.to_dict()
        convo_id = c.get("conversation_id")
        
        # Identify other user
        other_id = c.get("seeker_b_id") if c.get("seeker_a_id") == uid else c.get("seeker_a_id")
        other_doc = db.collection("profiles").document(other_id).get()
        
        other_user = None
        if other_doc.exists:
            odata = other_doc.to_dict()
            other_user = {
                "id": other_id,
                "name": odata.get("fullName") or odata.get("first_name") or "Seeker",
                "initial": (odata.get("fullName") or odata.get("first_name") or "S")[0].upper(),
                "age": odata.get("age", 25),
                "city": odata.get("city") or odata.get("location") or "Unknown",
                "occupation": odata.get("occupation") or "Private"
            }
            
        # Get last message
        msgs_query = db.collection("conversations").document(convo_id).collection("messages").order_by("created_at", direction="DESCENDING").limit(1).get()
        last_msg = None
        if msgs_query:
            mdata = msgs_query[0].to_dict()
            try:
                dt = datetime.fromisoformat(mdata.get("created_at"))
                time_str = dt.strftime("%I:%M %p")
            except Exception:
                time_str = ""
                
            last_msg = {
                "text": mdata.get("text", ""),
                "time": time_str,
                "is_mine": mdata.get("sender_id") == uid
            }
            
        result.append({
            "conversation_id": convo_id,
            "status": c.get("status", "ACTIVE"),
            "matchflow_step": c.get("matchflow_step", "CONVERSATION_OPEN"),
            "photo_unlocked": c.get("photo_unlocked", False),
            "created_at": c.get("created_at"),
            "other_user": other_user,
            "last_message": last_msg
        })
        
    return {"conversations": result}

@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    
    convo_doc = db.collection("conversations").document(conversation_id).get()
    if not convo_doc.exists:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    c = convo_doc.to_dict()
    # Check if participant
    if c.get("seeker_a_id") != uid and c.get("seeker_b_id") != uid:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")
        
    # Get messages
    msgs_docs = db.collection("conversations").document(conversation_id).collection("messages").order_by("created_at", direction="ASCENDING").get()
    
    messages = []
    for doc in msgs_docs:
        mdata = doc.to_dict()
        try:
            dt = datetime.fromisoformat(mdata.get("created_at"))
            time_str = dt.strftime("%I:%M %p")
        except Exception:
            time_str = ""
            
        messages.append({
            "id": doc.id,
            "text": mdata.get("text", ""),
            "msg_type": mdata.get("msg_type", "text"),
            "sender": "me" if mdata.get("sender_id") == uid else ("system" if mdata.get("sender_id") == "system" else "them"),
            "sender_id": mdata.get("sender_id"),
            "time": time_str
        })
        
    return {
        "conversation_id": conversation_id,
        "status": c.get("status", "ACTIVE"),
        "matchflow_step": c.get("matchflow_step", "CONVERSATION_OPEN"),
        "photo_unlocked": c.get("photo_unlocked", False),
        "messages": messages
    }

@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    req: SendMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    
    convo_doc = db.collection("conversations").document(conversation_id).get()
    if not convo_doc.exists:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    c = convo_doc.to_dict()
    # Check if participant
    if c.get("seeker_a_id") != uid and c.get("seeker_b_id") != uid:
        raise HTTPException(status_code=403, detail="Not a participant in this conversation")
        
    if c.get("status") != "ACTIVE":
        raise HTTPException(status_code=400, detail="This conversation is no longer active")
        
    new_msg_ref = db.collection("conversations").document(conversation_id).collection("messages").document()
    msg_id = new_msg_ref.id
    
    created_at = datetime.utcnow().isoformat()
    
    msg_data = {
        "sender_id": uid,
        "text": req.text,
        "msg_type": req.msg_type,
        "created_at": created_at
    }
    
    try:
        new_msg_ref.set(msg_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
        
    # Return formatted response
    try:
        time_str = datetime.utcnow().strftime("%I:%M %p")
    except Exception:
        time_str = ""
        
    return {
        "id": msg_id,
        "text": req.text,
        "msg_type": req.msg_type,
        "sender": "me",
        "time": time_str
    }


# ---------------------------------------------------------------------------
# Pinned Messages
# ---------------------------------------------------------------------------
@router.post("/{conversation_id}/messages/{message_id}/pin")
async def pin_message(
    conversation_id: str,
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    uid = current_user.get("uid")
    db = get_db()
    msg_ref = db.collection("conversations").document(conversation_id).collection("messages").document(message_id)
    if not msg_ref.get().exists:
        raise HTTPException(status_code=404, detail="Message not found")
    msg_ref.update({"pinned": True, "pinned_by": uid, "pinned_at": datetime.utcnow().isoformat()})
    return {"status": "pinned"}


@router.post("/{conversation_id}/messages/{message_id}/unpin")
async def unpin_message(
    conversation_id: str,
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    msg_ref = db.collection("conversations").document(conversation_id).collection("messages").document(message_id)
    if not msg_ref.get().exists:
        raise HTTPException(status_code=404, detail="Message not found")
    msg_ref.update({"pinned": False})
    return {"status": "unpinned"}


@router.get("/{conversation_id}/messages/pinned")
async def get_pinned_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    msgs = db.collection("conversations").document(conversation_id).collection("messages").where("pinned", "==", True).get()
    return [{"id": doc.id, **doc.to_dict()} for doc in msgs]

