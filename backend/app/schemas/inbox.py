from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
import uuid

class InboxCreateRequest(BaseModel):
    domain: Optional[str] = None
    custom_prefix: Optional[str] = None

class InboxResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email_address: str
    access_token: str
    created_at: datetime
    expires_at: datetime
    is_active: bool
    remaining_seconds: int

class ExtendInboxRequest(BaseModel):
    minutes: int = 10  # e.g., 10, 60, 1440

class DomainsResponse(BaseModel):
    domains: List[str]
