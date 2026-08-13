import io
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import generate_access_token, generate_random_email_prefix
from app.db.models import Inbox, Message, Attachment
from app.schemas.inbox import (
    InboxCreateRequest, InboxResponse, ExtendInboxRequest, DomainsResponse
)
from app.schemas.message import MessageSummary, MessageDetail, AttachmentSummary

router = APIRouter(prefix="/inbox", tags=["Inbox"])


def calculate_remaining_seconds(expires_at: datetime) -> int:
    now = datetime.now(timezone.utc)
    diff = int((expires_at - now).total_seconds())
    return max(0, diff)


def inbox_to_response(inbox: Inbox) -> InboxResponse:
    return InboxResponse(
        id=inbox.id,
        email_address=inbox.email_address,
        access_token=inbox.access_token,
        created_at=inbox.created_at,
        expires_at=inbox.expires_at,
        is_active=inbox.is_active,
        remaining_seconds=calculate_remaining_seconds(inbox.expires_at),
    )


@router.get("/domains", response_model=DomainsResponse)
async def get_available_domains():
    """List available domains for temp email creation."""
    return DomainsResponse(domains=settings.domains)


@router.post("", response_model=InboxResponse, status_code=status.HTTP_201_CREATED)
async def create_inbox(
    payload: InboxCreateRequest = None, db: AsyncSession = Depends(get_db)
):
    """Create a brand new temporary inbox and return email address + access token."""
    payload = payload or InboxCreateRequest()
    domain = payload.domain or settings.domains[0]
    if domain not in settings.domains:
        domain = settings.domains[0]

    prefix = (
        payload.custom_prefix.strip().lower()
        if payload.custom_prefix
        else generate_random_email_prefix()
    )
    # Keep only safe characters
    prefix = "".join(c for c in prefix if c.isalnum() or c in [".", "_", "-"])
    if not prefix:
        prefix = generate_random_email_prefix()

    email_address = f"{prefix}@{domain}"

    # Ensure address uniqueness — collision is rare but handled
    stmt = select(Inbox).where(Inbox.email_address == email_address)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        email_address = f"{prefix}{generate_random_email_prefix(4)}@{domain}"

    now = datetime.now(timezone.utc)
    inbox = Inbox(
        email_address=email_address,
        access_token=generate_access_token(),
        created_at=now,
        expires_at=now + timedelta(minutes=settings.DEFAULT_EXPIRATION_MINUTES),
        is_active=True,
    )
    db.add(inbox)
    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


@router.get("/{token}", response_model=InboxResponse)
async def get_inbox_status(token: str, db: AsyncSession = Depends(get_db)):
    """Get inbox info and remaining lifetime."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox or inbox.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bandeja no encontrada o expirada",
        )
    return inbox_to_response(inbox)


@router.get("/{token}/messages", response_model=List[MessageSummary])
async def get_inbox_messages(token: str, db: AsyncSession = Depends(get_db)):
    """List all messages received in this inbox, newest first."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox or inbox.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada"
        )

    msg_stmt = (
        select(Message)
        .options(selectinload(Message.attachments))
        .where(Message.inbox_id == inbox.id)
        .order_by(Message.received_at.desc())
    )
    msg_res = await db.execute(msg_stmt)
    messages = msg_res.scalars().all()

    return [
        MessageSummary(
            id=m.id,
            from_address=m.from_address,
            subject=m.subject,
            received_at=m.received_at,
            is_read=m.is_read,
            raw_size_kb=m.raw_size_kb,
            has_attachments=len(m.attachments) > 0,
        )
        for m in messages
    ]


@router.get("/{token}/messages/{message_id}", response_model=MessageDetail)
async def get_message_detail(
    token: str, message_id: str, db: AsyncSession = Depends(get_db)
):
    """Get full message content and mark it as read."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox or inbox.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada"
        )

    msg_stmt = (
        select(Message)
        .options(selectinload(Message.attachments))
        .where(Message.id == message_id, Message.inbox_id == inbox.id)
    )
    msg_res = await db.execute(msg_stmt)
    message = msg_res.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado"
        )

    if not message.is_read:
        message.is_read = True
        await db.commit()

    return MessageDetail(
        id=message.id,
        inbox_id=message.inbox_id,
        from_address=message.from_address,
        subject=message.subject,
        body_text=message.body_text,
        body_html=message.body_html,
        received_at=message.received_at,
        is_read=message.is_read,
        raw_size_kb=message.raw_size_kb,
        attachments=[
            AttachmentSummary(
                id=att.id,
                filename=att.filename,
                content_type=att.content_type,
                size_bytes=att.size_bytes,
            )
            for att in message.attachments
        ],
    )


@router.post("/{token}/extend", response_model=InboxResponse)
async def extend_inbox_lifetime(
    token: str, payload: ExtendInboxRequest, db: AsyncSession = Depends(get_db)
):
    """Extend inbox expiration time (+10 min, +1h, +24h)."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox or inbox.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada"
        )

    added_minutes = max(1, min(1440, payload.minutes))
    base_time = max(inbox.expires_at, datetime.now(timezone.utc))
    inbox.expires_at = base_time + timedelta(minutes=added_minutes)
    inbox.is_active = True  # Re-activate if it somehow expired

    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


@router.delete("/{token}")
async def delete_inbox(token: str, db: AsyncSession = Depends(get_db)):
    """Permanently delete a temporary inbox and all its messages."""
    stmt = select(Inbox).where(Inbox.access_token == token)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada"
        )

    await db.delete(inbox)
    await db.commit()
    return {"message": "Bandeja eliminada exitosamente"}


@router.get("/{token}/attachments/{attachment_id}")
async def download_attachment(
    token: str, attachment_id: str, db: AsyncSession = Depends(get_db)
):
    """Download a specific email attachment."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")

    att_stmt = (
        select(Attachment)
        .join(Message)
        .where(Attachment.id == attachment_id, Message.inbox_id == inbox.id)
    )
    att_res = await db.execute(att_stmt)
    attachment = att_res.scalar_one_or_none()

    if not attachment or not attachment.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo adjunto no encontrado",
        )

    return StreamingResponse(
        io.BytesIO(attachment.data),
        media_type=attachment.content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{attachment.filename}"'
        },
    )
