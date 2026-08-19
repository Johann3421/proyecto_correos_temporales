import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, DateTime, Boolean, ForeignKey, Float, Text, LargeBinary, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def far_future() -> datetime:
    return datetime(2099, 1, 1, tzinfo=timezone.utc)

class Inbox(Base):
    __tablename__ = "inboxes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_address: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    access_token: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=far_future, index=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Multi-inbox & Customization
    session_owner: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, index=True)
    label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Auto-Forwarding
    forward_to: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    forward_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")

    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="inbox", cascade="all, delete-orphan", passive_deletes=True
    )
    rules: Mapped[List["InboxRule"]] = relationship(
        "InboxRule", back_populates="inbox", cascade="all, delete-orphan", passive_deletes=True
    )

class InboxRule(Base):
    __tablename__ = "inbox_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inbox_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inboxes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'domain', 'subject', 'from'
    pattern: Mapped[str] = mapped_column(String(255), nullable=False)   # e.g., 'netflix.com' or 'código'
    action: Mapped[str] = mapped_column(String(50), default="notify_only", nullable=False) # 'notify_only', 'auto_save', 'forward'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    inbox: Mapped["Inbox"] = relationship("Inbox", back_populates="rules")

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_token: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inbox_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inboxes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    body_text: Mapped[str] = mapped_column(Text, default="", nullable=False)
    body_html: Mapped[str] = mapped_column(Text, default="", nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    raw_size_kb: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Save / history feature
    is_saved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    saved_by_session: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, default=None)

    inbox: Mapped["Inbox"] = relationship("Inbox", back_populates="messages")
    attachments: Mapped[List["Attachment"]] = relationship(
        "Attachment", back_populates="message", cascade="all, delete-orphan", passive_deletes=True
    )

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[Optional[bytes]] = mapped_column(LargeBinary, nullable=True)

    message: Mapped["Message"] = relationship("Message", back_populates="attachments")
