import io
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import generate_access_token, generate_random_email_prefix, generate_random_subdomain
from app.db.models import Inbox, Message, Attachment
from app.schemas.inbox import (
    InboxCreateRequest, InboxResponse, ExtendInboxRequest, DomainsResponse
)
from app.schemas.message import MessageSummary, MessageDetail, AttachmentSummary, SavedMessageSummary
from app.api.websocket import ws_manager

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


@router.get("/saved/{session_token}", response_model=List[SavedMessageSummary])
async def get_saved_messages(session_token: str, db: AsyncSession = Depends(get_db)):
    """Get all saved/favorited messages for a specific user session."""
    stmt = (
        select(Message, Inbox.email_address)
        .join(Inbox, Message.inbox_id == Inbox.id, isouter=True)
        .where(
            Message.is_saved == True,  # noqa: E712
            Message.saved_by_session == session_token,
        )
        .order_by(Message.received_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        SavedMessageSummary(
            id=msg.id,
            from_address=msg.from_address,
            subject=msg.subject,
            body_text=msg.body_text,
            body_html=msg.body_html,
            received_at=msg.received_at,
            raw_size_kb=msg.raw_size_kb,
            original_inbox_email=inbox_email or "(bandeja eliminada)",
        )
        for msg, inbox_email in rows
    ]


@router.post("", response_model=InboxResponse, status_code=status.HTTP_201_CREATED)
async def create_inbox(
    payload: InboxCreateRequest = None, db: AsyncSession = Depends(get_db)
):
    """Create a brand new temporary inbox and return email address + access token."""
    payload = payload or InboxCreateRequest()
    base_domain = payload.domain or settings.domains[0]
    if base_domain not in settings.domains:
        base_domain = settings.domains[0]

    prefix = (
        payload.custom_prefix.strip().lower()
        if payload.custom_prefix
        else generate_random_email_prefix()
    )
    # Keep only safe characters
    prefix = "".join(c for c in prefix if c.isalnum() or c in [".", "_", "-"])
    if not prefix:
        prefix = generate_random_email_prefix()

    # Build email address with optional dynamic subdomain
    if settings.ENABLE_RANDOM_SUBDOMAINS:
        subdomain = generate_random_subdomain()
        email_address = f"{prefix}@{subdomain}.{base_domain}"
    else:
        email_address = f"{prefix}@{base_domain}"

    # Ensure address uniqueness
    stmt = select(Inbox).where(Inbox.email_address == email_address)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        extra = generate_random_email_prefix(4)
        if settings.ENABLE_RANDOM_SUBDOMAINS:
            subdomain = generate_random_subdomain()
            email_address = f"{prefix}{extra}@{subdomain}.{base_domain}"
        else:
            email_address = f"{prefix}{extra}@{base_domain}"

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
            is_saved=m.is_saved,
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
        is_saved=message.is_saved,
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


@router.post("/{token}/messages/{message_id}/save")
async def toggle_save_message(
    token: str, message_id: str, session_token: str = "", db: AsyncSession = Depends(get_db)
):
    """Toggle save/unsave a message. Saved messages persist beyond inbox expiry."""
    stmt = select(Inbox).where(Inbox.access_token == token)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    msg_stmt = select(Message).where(Message.id == message_id, Message.inbox_id == inbox.id)
    msg_res = await db.execute(msg_stmt)
    message = msg_res.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    # Toggle
    message.is_saved = not message.is_saved
    if message.is_saved:
        message.saved_by_session = session_token or token
    else:
        message.saved_by_session = None

    await db.commit()
    return {"saved": message.is_saved, "message_id": str(message.id)}


@router.post("/{token}/test")
async def send_test_email(token: str, db: AsyncSession = Depends(get_db)):
    """Inject a test email directly into the inbox (bypasses SMTP for testing)."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)  # noqa: E712
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox or inbox.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=404, detail="Bandeja no encontrada o expirada")

    now = datetime.now(timezone.utc)
    test_msg = Message(
        inbox_id=inbox.id,
        from_address="test@tempmail-system.local",
        subject=f"Correo de prueba — {now.strftime('%H:%M:%S')}",
        body_text=(
            f"Este es un correo de prueba inyectado directamente.\n\n"
            f"Dirección de destino: {inbox.email_address}\n"
            f"Fecha: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            f"Si puedes leer este mensaje, la cadena completa funciona:\n"
            f"  • Base de datos ✓\n"
            f"  • API REST ✓\n"
            f"  • WebSocket (notificación en vivo) ✓\n"
            f"  • Visor de mensajes ✓\n\n"
            f"Para recibir correos reales, verifica que tu servidor SMTP\n"
            f"(Postfix/Billonmail) tenga configurado el relay hacia el\n"
            f"contenedor en el puerto 2512."
        ),
        body_html=(
            f"<div style='font-family:sans-serif;max-width:480px;'>"
            f"<h2 style='margin-bottom:8px;'>Correo de prueba</h2>"
            f"<p style='color:#666;font-size:14px;'>Inyectado directamente en la bandeja.</p>"
            f"<hr style='border:none;border-top:1px solid #eee;margin:16px 0;'>"
            f"<table style='font-size:13px;border-collapse:collapse;width:100%;'>"
            f"<tr><td style='padding:4px 8px;color:#999;'>Para:</td>"
            f"<td style='padding:4px 8px;font-family:monospace;'>{inbox.email_address}</td></tr>"
            f"<tr><td style='padding:4px 8px;color:#999;'>Fecha:</td>"
            f"<td style='padding:4px 8px;'>{now.strftime('%Y-%m-%d %H:%M:%S UTC')}</td></tr>"
            f"</table>"
            f"<hr style='border:none;border-top:1px solid #eee;margin:16px 0;'>"
            f"<p style='font-size:13px;'>Si lees esto, la cadena completa funciona:</p>"
            f"<ul style='font-size:13px;'>"
            f"<li>Base de datos ✓</li>"
            f"<li>API REST ✓</li>"
            f"<li>WebSocket ✓</li>"
            f"<li>Visor de mensajes ✓</li>"
            f"</ul></div>"
        ),
        raw_size_kb=1.2,
        is_read=False,
    )
    db.add(test_msg)
    await db.flush()
    await db.commit()
    await db.refresh(test_msg)

    # Push WebSocket notification
    ws_payload = {
        "type": "NEW_MESSAGE",
        "message": {
            "id": str(test_msg.id),
            "from_address": test_msg.from_address,
            "subject": test_msg.subject,
            "received_at": test_msg.received_at.isoformat(),
            "is_read": False,
            "raw_size_kb": test_msg.raw_size_kb,
            "has_attachments": False,
            "is_saved": False,
        },
    }
    await ws_manager.broadcast_to_token(inbox.access_token, ws_payload)

    return {"message": "Correo de prueba enviado", "id": str(test_msg.id)}


@router.post("/{token}/extend", response_model=InboxResponse)
async def extend_inbox_lifetime(
    token: str, payload: ExtendInboxRequest, db: AsyncSession = Depends(get_db)
):
    """Extend inbox expiration time."""
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
    inbox.is_active = True

    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


@router.delete("/{token}")
async def delete_inbox(token: str, db: AsyncSession = Depends(get_db)):
    """Permanently delete a temporary inbox. Saved messages are preserved."""
    stmt = select(Inbox).where(Inbox.access_token == token)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada"
        )

    # Detach saved messages from inbox before deletion (set inbox_id to NULL won't work with FK)
    # Instead: saved messages stay, unsaved messages cascade-delete with inbox
    # We need to nullify the FK for saved messages first
    # Actually, since FK has ondelete=CASCADE, we need to handle saved messages differently.
    # Move saved messages: set is_saved but they'll be deleted by cascade.
    # Better approach: delete only unsaved messages, then delete the inbox record
    # But cascade will delete all messages...
    # Simplest: before deleting inbox, remove the FK constraint on saved messages
    # Actually the cleanest: just delete unsaved messages manually, then the inbox
    from sqlalchemy import delete as sa_delete

    # Delete unsaved messages for this inbox
    del_unsaved = sa_delete(Message).where(
        Message.inbox_id == inbox.id,
        Message.is_saved == False,  # noqa: E712
    )
    await db.execute(del_unsaved)

    # Check if there are any saved messages left
    saved_check = select(Message).where(
        Message.inbox_id == inbox.id,
        Message.is_saved == True,  # noqa: E712
    )
    saved_res = await db.execute(saved_check)
    has_saved = saved_res.scalar_one_or_none() is not None

    if has_saved:
        # Just deactivate the inbox, keep it for saved messages reference
        inbox.is_active = False
        inbox.expires_at = datetime.now(timezone.utc)
        await db.commit()
    else:
        await db.delete(inbox)
        await db.commit()

    return {"message": "Bandeja eliminada exitosamente"}


@router.get("/{token}/attachments/{attachment_id}")
async def download_attachment(
    token: str, attachment_id: str, db: AsyncSession = Depends(get_db)
):
    """Download a specific email attachment."""
    stmt = select(Inbox).where(Inbox.access_token == token)
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
