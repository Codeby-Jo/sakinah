from pydantic import BaseModel, Field
from datetime import datetime

class SignalCreate(BaseModel):
    target_uid: str = Field(..., description="The UID of the person being signaled")
    
class SignalResponse(BaseModel):
    id: str
    from_uid: str
    target_uid: str
    timestamp: datetime
    is_mutual: bool = False

class MatchResponse(BaseModel):
    match_id: str
    users: list[str]
    matched_at: datetime
    # Photos are only unblurred if the match is mutual, which this response implies.
