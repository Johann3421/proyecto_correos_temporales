import logging
import asyncio
from datetime import datetime, timezone, timedelta
from aiosmtpd.smtp import SMTP
from sqlalchemy import select
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from sqlalchemy.orm import selectinload
from app.db.models import Inbox, Message, Attachment, InboxRule
from app.services.parser import parse_raw_email
from app.services.forwarder import forward_incoming_email
from app.api.websocket import ws_manager

logger = logging.getLogger("tempmail.smtp")


class CustomSMTPHandler:
    """
    aiosmtpd message handler running natively in FastAPI's main asyncio event loop.
    """

    async def handle_DATA(self, server, session, envelope):
        rcpt_tos = envelope.rcpt_tos
        peer = session.peer
        logger.info(
            f"Incoming email from {envelope.mail_from} "
            f"to {rcpt_tos} from peer {peer}"
        )

        raw_content: bytes = envelope.content
        parsed_email = parse_raw_email(raw_content)

        async with AsyncSessionLocal() as db:
            for rcpt in rcpt_tos:
                # Robustly clean email (remove angle brackets if present and lowercase)
                clean_rcpt = rcpt.strip().lower().strip("<>").strip()

                # Find active inbox (with rules eager-loaded)
                stmt = (
                    select(Inbox)
                    .options(selectinload(Inbox.rules))
                    .where(
                        Inbox.email_address == clean_rcpt,
                        Inbox.is_active == True,  # noqa: E712
                    )
                )
                result = await db.execute(stmt)
                inbox = result.scalar_one_or_none()

                if not inbox:
                    logger.warning(f"No active inbox found for: {clean_rcpt}")
                    continue

                # Check custom rules
                auto_save = False
                rule_forward = False
                matched_rules = []

                from_lower = parsed_email["from_address"].lower()
                subject_lower = parsed_email["subject"].lower()

                for rule in inbox.rules:
                    if not rule.is_active:
                        continue
                    patt = rule.pattern.lower().strip()
                    is_match = False
                    if rule.rule_type == "domain" and patt in from_lower:
                        is_match = True
                    elif rule.rule_type == "subject" and patt in subject_lower:
                        is_match = True
                    elif rule.rule_type == "from" and patt in from_lower:
                        is_match = True

                    if is_match:
                        matched_rules.append(rule.pattern)
                        if rule.action == "auto_save":
                            auto_save = True
                        elif rule.action == "forward":
                            rule_forward = True

                # Persist the message
                new_message = Message(
                    inbox_id=inbox.id,
                    from_address=parsed_email["from_address"],
                    subject=parsed_email["subject"],
                    body_text=parsed_email["body_text"],
                    body_html=parsed_email["body_html"],
                    raw_size_kb=parsed_email["raw_size_kb"],
                    is_read=False,
                    is_saved=auto_save,
                    saved_by_session=inbox.session_owner if auto_save else None,
                )
                db.add(new_message)
                await db.flush()

                # Persist attachments
                for att in parsed_email["attachments"]:
                    if att["size_bytes"] <= settings.MAX_ATTACHMENT_SIZE_BYTES:
                        db.add(
                            Attachment(
                                message_id=new_message.id,
                                filename=att["filename"],
                                content_type=att["content_type"],
                                size_bytes=att["size_bytes"],
                                data=att["data"],
                            )
                        )

                await db.commit()
                await db.refresh(new_message)

                logger.info(
                    f"Message {new_message.id} successfully stored for inbox {clean_rcpt}"
                )

                # Check if auto-forwarding is enabled
                should_forward = (inbox.forward_enabled and bool(inbox.forward_to)) or (rule_forward and bool(inbox.forward_to))
                if should_forward:
                    asyncio.create_task(
                        forward_incoming_email(
                            target_email=inbox.forward_to,
                            original_from=parsed_email["from_address"],
                            inbox_address=inbox.email_address,
                            subject=parsed_email["subject"],
                            body_text=parsed_email["body_text"],
                            body_html=parsed_email["body_html"],
                            attachments=parsed_email["attachments"],
                        )
                    )

                # Push real-time WebSocket notification
                ws_payload = {
                    "type": "NEW_MESSAGE",
                    "message": {
                        "id": str(new_message.id),
                        "from_address": new_message.from_address,
                        "subject": new_message.subject,
                        "received_at": new_message.received_at.isoformat(),
                        "is_read": False,
                        "raw_size_kb": new_message.raw_size_kb,
                        "has_attachments": len(parsed_email["attachments"]) > 0,
                        "is_saved": new_message.is_saved,
                        "matched_rules": matched_rules,
                    },
                }
                await ws_manager.broadcast_to_token(inbox.access_token, ws_payload)

        return "250 Message accepted for delivery"


async def start_smtp_server():
    """
    Start the SMTP server on the current running asyncio event loop.
    This eliminates cross-thread loop collisions with SQLAlchemy/asyncpg.
    """
    loop = asyncio.get_running_loop()
    handler = CustomSMTPHandler()
    server = await loop.create_server(
        lambda: SMTP(handler, enable_SMTPUTF8=True),
        host=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
    )
    logger.info(
        f"SMTP server successfully listening on {settings.SMTP_HOST}:{settings.SMTP_PORT} (native event loop)"
    )
    return server
