import io
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from email.message import EmailMessage
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy import select, and_, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.core.security import generate_access_token, generate_random_email_prefix, generate_random_subdomain
from app.db.models import Inbox, Message, Attachment, InboxRule, SupportTicket
from app.schemas.inbox import (
    InboxCreateRequest, InboxResponse, ExtendInboxRequest, DomainsResponse,
    InboxRenameRequest, InboxForwardRequest, InboxRuleCreate, InboxRuleResponse,
    SupportTicketCreate, SupportTicketResponse, StatsResponse, StatsDomainCount, StatsDayCount
)
from app.schemas.message import MessageSummary, MessageDetail, AttachmentSummary, SavedMessageSummary
from app.api.websocket import ws_manager

router = APIRouter(prefix="/inbox", tags=["Inbox"])


def inbox_to_response(inbox: Inbox, unread_count: int = 0, total_messages: int = 0) -> InboxResponse:
    return InboxResponse(
        id=inbox.id,
        email_address=inbox.email_address,
        access_token=inbox.access_token,
        created_at=inbox.created_at,
        expires_at=inbox.expires_at,
        is_active=inbox.is_active,
        remaining_seconds=0,
        label=inbox.label,
        session_owner=inbox.session_owner,
        forward_to=inbox.forward_to,
        forward_enabled=inbox.forward_enabled,
        unread_count=unread_count,
        total_messages=total_messages,
    )


# ==================== STATIC / NON-TOKEN ROUTES ====================

@router.get("/domains", response_model=DomainsResponse)
async def get_available_domains():
    """List available domains for temp email creation."""
    return DomainsResponse(domains=settings.domains)


@router.get("/user/{session_token}/list", response_model=List[InboxResponse])
async def list_user_inboxes(session_token: str, db: AsyncSession = Depends(get_db)):
    """List all active inboxes associated with a user session."""
    stmt = (
        select(
            Inbox,
            func.count(Message.id).label("total_msgs"),
            func.count(func.nullif(Message.is_read, True)).label("unread_msgs")
        )
        .outerjoin(Message, Message.inbox_id == Inbox.id)
        .where(Inbox.session_owner == session_token, Inbox.is_active == True)
        .group_by(Inbox.id)
        .order_by(Inbox.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    return [
        inbox_to_response(inbox, unread_count=unread_count or 0, total_messages=total_count or 0)
        for inbox, total_count, unread_count in rows
    ]


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


@router.get("/stats/{session_token}", response_model=StatsResponse)
async def get_user_stats(session_token: str, db: AsyncSession = Depends(get_db)):
    """Get metrics and usage statistics for user session."""
    # Inboxes counts
    inboxes_stmt = select(
        func.count(Inbox.id).label("total"),
        func.count(func.nullif(Inbox.is_active, False)).label("active")
    ).where(Inbox.session_owner == session_token)
    inboxes_res = await db.execute(inboxes_stmt)
    inbox_counts = inboxes_res.first()
    total_inboxes = inbox_counts.total if inbox_counts else 0
    active_inboxes = inbox_counts.active if inbox_counts else 0

    # Total messages received across inboxes
    inbox_ids_stmt = select(Inbox.id).where(Inbox.session_owner == session_token)
    
    msgs_stmt = select(
        func.count(Message.id).label("total_msgs"),
        func.count(func.nullif(Message.is_saved, False)).label("saved_msgs")
    ).where(Message.inbox_id.in_(inbox_ids_stmt))
    msgs_res = await db.execute(msgs_stmt)
    msg_counts = msgs_res.first()
    total_msgs = msg_counts.total_msgs if msg_counts else 0
    saved_msgs = msg_counts.saved_msgs if msg_counts else 0

    # Top domains
    all_from_stmt = select(Message.from_address).where(Message.inbox_id.in_(inbox_ids_stmt))
    all_from_res = await db.execute(all_from_stmt)
    from_addresses = all_from_res.scalars().all()

    domain_counts_dict = {}
    for addr in from_addresses:
        if "@" in addr:
            dom = addr.split("@")[-1].strip().lower()
        else:
            dom = "otro"
        domain_counts_dict[dom] = domain_counts_dict.get(dom, 0) + 1

    sorted_domains = sorted(domain_counts_dict.items(), key=lambda x: x[1], reverse=True)[:5]
    top_senders = [StatsDomainCount(domain=d, count=c) for d, c in sorted_domains]

    # Messages by day (last 7 days)
    days_dict = {}
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_str = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        days_dict[day_str] = 0

    dates_stmt = select(Message.received_at).where(Message.inbox_id.in_(inbox_ids_stmt))
    dates_res = await db.execute(dates_stmt)
    for d in dates_res.scalars().all():
        d_str = d.strftime("%Y-%m-%d")
        if d_str in days_dict:
            days_dict[d_str] += 1

    messages_by_day = [StatsDayCount(date=d, count=c) for d, c in days_dict.items()]

    return StatsResponse(
        total_inboxes=total_inboxes,
        active_inboxes=active_inboxes,
        total_messages_received=total_msgs,
        saved_messages_count=saved_msgs,
        top_senders=top_senders,
        messages_by_day=messages_by_day,
    )


@router.post("/support", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def submit_support_ticket(payload: SupportTicketCreate, db: AsyncSession = Depends(get_db)):
    """Submit a user support or feedback ticket."""
    ticket = SupportTicket(
        session_token=payload.session_token,
        name=payload.name.strip()[:100],
        email=payload.email.strip()[:255],
        subject=payload.subject.strip()[:255],
        message=payload.message.strip(),
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


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
    prefix = "".join(c for c in prefix if c.isalnum() or c in [".", "_", "-"])
    if not prefix:
        prefix = generate_random_email_prefix()

    should_use_subdomain = payload.use_subdomain if payload.use_subdomain is not None else settings.ENABLE_RANDOM_SUBDOMAINS

    if should_use_subdomain:
        subdomain = generate_random_subdomain()
        email_address = f"{prefix}@{subdomain}.{base_domain}"
    else:
        email_address = f"{prefix}@{base_domain}"

    stmt = select(Inbox).where(Inbox.email_address == email_address)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        extra = generate_random_email_prefix(4)
        if should_use_subdomain:
            subdomain = generate_random_subdomain()
            email_address = f"{prefix}{extra}@{subdomain}.{base_domain}"
        else:
            email_address = f"{prefix}{extra}@{base_domain}"

    now = datetime.now(timezone.utc)
    inbox = Inbox(
        email_address=email_address,
        access_token=generate_access_token(),
        created_at=now,
        expires_at=datetime(2099, 1, 1, tzinfo=timezone.utc),
        is_active=True,
        label=payload.label or f"Buzón {email_address.split('@')[0]}",
        session_owner=payload.session_token,
    )
    db.add(inbox)
    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


# ==================== PARAMETERIZED /{token} ROUTES ====================

@router.get("/{token}", response_model=InboxResponse)
async def get_inbox_status(token: str, db: AsyncSession = Depends(get_db)):
    """Get inbox info."""
    stmt = (
        select(
            Inbox,
            func.count(Message.id).label("total_msgs"),
            func.count(func.nullif(Message.is_read, True)).label("unread_msgs")
        )
        .outerjoin(Message, Message.inbox_id == Inbox.id)
        .where(Inbox.access_token == token, Inbox.is_active == True)
        .group_by(Inbox.id)
    )
    res = await db.execute(stmt)
    row = res.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bandeja no encontrada",
        )
    inbox, total_msgs, unread_msgs = row
    return inbox_to_response(inbox, unread_count=unread_msgs or 0, total_messages=total_msgs or 0)


@router.patch("/{token}/label", response_model=InboxResponse)
async def rename_inbox(token: str, payload: InboxRenameRequest, db: AsyncSession = Depends(get_db)):
    """Rename inbox label."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    inbox.label = payload.label.strip()[:100]
    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


@router.put("/{token}/forward", response_model=InboxResponse)
async def update_forwarding(token: str, payload: InboxForwardRequest, db: AsyncSession = Depends(get_db)):
    """Configure auto-forwarding to user's real email address."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    inbox.forward_to = payload.forward_to.strip().lower() if payload.forward_to else None
    inbox.forward_enabled = payload.forward_enabled if inbox.forward_to else False
    await db.commit()
    await db.refresh(inbox)
    return inbox_to_response(inbox)


@router.get("/{token}/rules", response_model=List[InboxRuleResponse])
async def get_inbox_rules(token: str, db: AsyncSession = Depends(get_db)):
    """List all custom filter rules for this inbox."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    rules_stmt = select(InboxRule).where(InboxRule.inbox_id == inbox.id).order_by(InboxRule.created_at.desc())
    rules_res = await db.execute(rules_stmt)
    return rules_res.scalars().all()


@router.post("/{token}/rules", response_model=InboxRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_inbox_rule(token: str, payload: InboxRuleCreate, db: AsyncSession = Depends(get_db)):
    """Create a new filter rule."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    rule = InboxRule(
        inbox_id=inbox.id,
        rule_type=payload.rule_type,
        pattern=payload.pattern.strip().lower(),
        action=payload.action,
        is_active=True,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/{token}/rules/{rule_id}")
async def delete_inbox_rule(token: str, rule_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a filter rule."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    rule_stmt = select(InboxRule).where(InboxRule.id == rule_id, InboxRule.inbox_id == inbox.id)
    rule_res = await db.execute(rule_stmt)
    rule = rule_res.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Regla no encontrada")

    await db.delete(rule)
    await db.commit()
    return {"message": "Regla eliminada"}


@router.get("/{token}/messages", response_model=List[MessageSummary])
async def get_inbox_messages(token: str, db: AsyncSession = Depends(get_db)):
    """List all messages received in this inbox, newest first."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
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
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
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
    """Toggle save/unsave a message."""
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

    message.is_saved = not message.is_saved
    if message.is_saved:
        message.saved_by_session = session_token or token
    else:
        message.saved_by_session = None

    await db.commit()
    return {"saved": message.is_saved, "message_id": str(message.id)}


@router.get("/{token}/messages/{message_id}/export/eml")
async def export_message_eml(token: str, message_id: str, db: AsyncSession = Depends(get_db)):
    """Export a message as an RFC822 .eml file."""
    stmt = select(Inbox).where(Inbox.access_token == token)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()
    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    msg_stmt = select(Message).options(selectinload(Message.attachments)).where(Message.id == message_id, Message.inbox_id == inbox.id)
    msg_res = await db.execute(msg_stmt)
    message = msg_res.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    eml = EmailMessage()
    eml["Subject"] = message.subject
    eml["From"] = message.from_address
    eml["To"] = inbox.email_address
    eml["Date"] = message.received_at.strftime("%a, %d %b %Y %H:%M:%S +0000")
    eml["X-Mailer"] = "AirInbox Mail Exporter"

    eml.set_content(message.body_text or "")
    if message.body_html:
        eml.add_alternative(message.body_html, subtype="html")

    for att in message.attachments:
        if att.data:
            maintype, subtype = "application", "octet-stream"
            if "/" in att.content_type:
                maintype, subtype = att.content_type.split("/", 1)
            eml.add_attachment(att.data, maintype=maintype, subtype=subtype, filename=att.filename)

    eml_bytes = eml.as_bytes()
    filename = f"email_{message.id}_{datetime.now().strftime('%Y%m%d')}.eml"

    return StreamingResponse(
        io.BytesIO(eml_bytes),
        media_type="message/rfc822",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/{token}/messages/{message_id}/export/html")
async def export_message_html(token: str, message_id: str, db: AsyncSession = Depends(get_db)):
    """Export message as a clean standalone HTML page."""
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

    html_doc = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{message.subject or 'Correo Exportado'}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
        .email-container {{ max-width: 780px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }}
        .header {{ padding: 20px 24px; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }}
        .header h1 {{ margin: 0 0 12px 0; font-size: 18px; color: #0f172a; }}
        .meta-row {{ font-size: 13px; color: #64748b; margin-bottom: 4px; }}
        .meta-row strong {{ color: #334155; }}
        .body {{ padding: 24px; font-size: 14px; line-height: 1.6; color: #334155; }}
        .footer {{ padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }}
        @media print {{ body {{ background: #fff; padding: 0; }} .email-container {{ border: none; box-shadow: none; }} }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>{message.subject or '(Sin asunto)'}</h1>
            <div class="meta-row"><strong>De:</strong> {message.from_address}</div>
            <div class="meta-row"><strong>Para:</strong> {inbox.email_address}</div>
            <div class="meta-row"><strong>Fecha:</strong> {message.received_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</div>
        </div>
        <div class="body">
            {message.body_html or f'<pre style="white-space:pre-wrap;font-family:inherit;">{message.body_text}</pre>'}
        </div>
        <div class="footer">
            Exportado desde AirInbox — {inbox.email_address}
        </div>
    </div>
</body>
</html>"""

    filename = f"email_{message.id}.html"
    return Response(
        content=html_doc,
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.post("/{token}/test")
async def send_test_email(token: str, db: AsyncSession = Depends(get_db)):
    """Inject a test email directly into the inbox."""
    stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
        raise HTTPException(status_code=404, detail="Bandeja no encontrada")

    now = datetime.now(timezone.utc)
    test_msg = Message(
        inbox_id=inbox.id,
        from_address="verificacion@seguridad.local",
        subject=f"Código de verificación: 849-210 — {now.strftime('%H:%M:%S')}",
        body_text=(
            f"Tu código de verificación es: 849210\n\n"
            f"Buzón de destino: {inbox.email_address}\n"
            f"Fecha de recepción: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
            f"Este correo de prueba confirma la sincronización en vivo y la persistencia de datos."
        ),
        body_html=(
            f"<div style='font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;padding:8px;'>"
            f"<h2 style='color:#0f172a;margin-bottom:8px;font-size:18px;'>Código de verificación</h2>"
            f"<p style='color:#475569;font-size:14px;'>Usa el siguiente código para completar tu registro:</p>"
            f"<div style='background:#f1f5f9;border:1px solid #cbd5e1;padding:16px;text-align:center;"
            f"border-radius:6px;font-size:24px;font-weight:bold;letter-spacing:4px;color:#0284c7;margin:16px 0;'>"
            f"849-210"
            f"</div>"
            f"<p style='font-size:12px;color:#94a3b8;'>Buzón: <code>{inbox.email_address}</code> | {now.strftime('%H:%M:%S UTC')}</p>"
            f"</div>"
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


@router.delete("/{token}")
async def delete_inbox(token: str, db: AsyncSession = Depends(get_db)):
    """Permanently delete a temporary inbox. Saved messages are preserved."""
    stmt = select(Inbox).where(Inbox.access_token == token)
    res = await db.execute(stmt)
    inbox = res.scalar_one_or_none()

    if not inbox:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bandeja no encontrada")

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
        inbox.is_active = False
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
