from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict
import uuid

class InboxCreateRequest(BaseModel):
    domain: Optional[str] = None
    custom_prefix: Optional[str] = None
    label: Optional[str] = None
    session_token: Optional[str] = None

class InboxResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email_address: str
    access_token: str
    created_at: datetime
    expires_at: datetime
    is_active: bool
    remaining_seconds: int = 0
    label: Optional[str] = None
    session_owner: Optional[str] = None
    forward_to: Optional[str] = None
    forward_enabled: bool = False
    unread_count: int = 0
    total_messages: int = 0

class InboxRenameRequest(BaseModel):
    label: str

class InboxForwardRequest(BaseModel):
    forward_to: str
    forward_enabled: bool = True

class InboxRuleCreate(BaseModel):
    rule_type: str  # 'domain', 'subject', 'from'
    pattern: str
    action: str = "notify_only"  # 'notify_only', 'auto_save', 'forward'

class InboxRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    inbox_id: uuid.UUID
    rule_type: str
    pattern: str
    action: str
    is_active: bool
    created_at: datetime

class SupportTicketCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str
    session_token: Optional[str] = None

class SupportTicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime

class StatsDomainCount(BaseModel):
    domain: str
    count: int

class StatsDayCount(BaseModel):
    date: str
    count: int

class StatsResponse(BaseModel):
    total_inboxes: int
    active_inboxes: int
    total_messages_received: int
    saved_messages_count: int
    top_senders: List[StatsDomainCount]
    messages_by_day: List[StatsDayCount]

class DomainsResponse(BaseModel):
    domains: List[str]
