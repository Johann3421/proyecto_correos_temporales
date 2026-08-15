from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
import uuid

class AttachmentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    content_type: str
    size_bytes: int

class MessageSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_address: str
    subject: str
    received_at: datetime
    is_read: bool
    raw_size_kb: float
    has_attachments: bool
    is_saved: bool = False

class MessageDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    inbox_id: uuid.UUID
    from_address: str
    subject: str
    body_text: str
    body_html: str
    received_at: datetime
    is_read: bool
    raw_size_kb: float
    is_saved: bool = False
    attachments: List[AttachmentSummary] = []

class SavedMessageSummary(BaseModel):
    """A saved message that persists beyond inbox expiry."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_address: str
    subject: str
    body_text: str
    body_html: str
    received_at: datetime
    raw_size_kb: float
    original_inbox_email: str = ""
