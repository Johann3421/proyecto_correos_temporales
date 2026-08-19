import logging
from email.message import EmailMessage
import aiosmtplib
from app.core.config import settings

logger = logging.getLogger("tempmail.forwarder")

async def forward_incoming_email(
    target_email: str,
    original_from: str,
    inbox_address: str,
    subject: str,
    body_text: str,
    body_html: str,
    attachments: list = None
):
    """
    Forward incoming email to user's real email address (e.g. Gmail / Outlook).
    """
    if not settings.FORWARD_SMTP_HOST:
        logger.info(
            f"Forwarding triggered for {inbox_address} -> {target_email}, "
            f"but FORWARD_SMTP_HOST is not configured. Skipping SMTP send."
        )
        return False

    try:
        msg = EmailMessage()
        clean_subject = f"[AirInbox - {inbox_address}] {subject or '(Sin asunto)'}"
        msg["Subject"] = clean_subject
        msg["From"] = f"AirInbox Relay <{settings.FORWARD_FROM_EMAIL}>"
        msg["To"] = target_email
        msg["Reply-To"] = original_from
        msg["X-Original-From"] = original_from
        msg["X-AirInbox-Recipient"] = inbox_address

        forward_banner = (
            f"\n\n---\n"
            f"📨 Este correo fue recibido en tu buzón temporal: {inbox_address}\n"
            f"Remitente original: {original_from}\n"
            f"Gestiona tus bandejas en AirInbox."
        )

        forward_banner_html = (
            f"<div style='margin-top:24px;padding:12px 16px;background:#f4f4f5;"
            f"border-left:4px solid #0284c7;font-family:sans-serif;font-size:12px;color:#52525b;'>"
            f"<strong>AirInbox Relay</strong><br>"
            f"Mensaje recibido originalmente en: <code>{inbox_address}</code><br>"
            f"Remitente original: <code>{original_from}</code>"
            f"</div>"
        )

        plain_content = (body_text or "Este mensaje no contiene texto plano.") + forward_banner
        msg.set_content(plain_content)

        if body_html:
            html_content = body_html + forward_banner_html
            msg.add_alternative(html_content, subtype="html")

        # Add attachments if any
        if attachments:
            for att in attachments:
                if att.get("data"):
                    maintype, subtype = "application", "octet-stream"
                    ctype = att.get("content_type", "")
                    if "/" in ctype:
                        maintype, subtype = ctype.split("/", 1)
                    msg.add_attachment(
                        att["data"],
                        maintype=maintype,
                        subtype=subtype,
                        filename=att.get("filename", "adjunto.bin")
                    )

        # Send via aiosmtplib
        await aiosmtplib.send(
            msg,
            hostname=settings.FORWARD_SMTP_HOST,
            port=settings.FORWARD_SMTP_PORT,
            username=settings.FORWARD_SMTP_USER or None,
            password=settings.FORWARD_SMTP_PASSWORD or None,
            start_tls=settings.FORWARD_SMTP_USE_TLS if settings.FORWARD_SMTP_PORT != 465 else False,
            use_tls=True if settings.FORWARD_SMTP_PORT == 465 else False,
            timeout=15
        )
        logger.info(f"Successfully forwarded email from {inbox_address} to {target_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to forward email from {inbox_address} to {target_email}: {e}")
        return False
