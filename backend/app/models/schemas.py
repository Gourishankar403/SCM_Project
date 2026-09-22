from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None

class RequestPayload(BaseModel):
    method: str
    url: str
    user_agent: str
    payload: str
    company_domain: str

class RequestLogResponse(BaseModel):
    id: int
    timestamp: datetime
    method: str
    url: str
    is_attack: bool
    
    class Config:
        from_attributes = True
