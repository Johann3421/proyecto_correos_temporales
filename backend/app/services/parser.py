import email
from email import policy
from email.parser import BytesParser
from email.header import decode_header
from typing import Dict, Any, List
import bleach

ALLOWED_TAGS = [
    'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol',
    'p', 'strong', 'ul', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'hr', 'br', 'style'
]

ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'style'],
    '*': ['style', 'class', 'align', 'valign', 'color']
}

ALLOWED_STYLES = [
    'color', 'background-color', 'font-family', 'font-size', 'font-weight',
    'text-align', 'padding', 'margin', 'border', 'width', 'height', 'max-width'
]

def sanitize_html(html_content: str) -> str:
    """Sanitize HTML against XSS vulnerabilities."""
    if not html_content:
        return ""
    try:
        clean = bleach.clean(
            html_content,
            tags=ALLOWED_TAGS,
            attributes=ALLOWED_ATTRIBUTES,
            styles=ALLOWED_STYLES,
            strip=True
        )
        return clean
    except Exception:
        # Fallback basic clean if bleach encounters weirdness
        return html_content.replace("<script>", "").replace("</script>", "")

def decode_mime_header(header_value: str) -> str:
    if not header_value:
        return ""
    decoded_fragments = decode_header(header_value)
    result = []
    for fragment, encoding in decoded_fragments:
        if isinstance(fragment, bytes):
            charset = encoding or 'utf-8'
            try:
                result.append(fragment.decode(charset, errors='replace'))
            except Exception:
                result.append(fragment.decode('utf-8', errors='replace'))
        else:
            result.append(str(fragment))
    return "".join(result)

def parse_raw_email(raw_bytes: bytes) -> Dict[str, Any]:
    """Parse raw RFC822 email bytes into structured text, HTML, and attachments."""
    msg = BytesParser(policy=policy.default).parsebytes(raw_bytes)
    
    subject = decode_mime_header(msg.get("subject", "(Sin asunto)"))
    from_address = decode_mime_header(msg.get("from", "Desconocido"))
    
    body_text = ""
    body_html = ""
    attachments: List[Dict[str, Any]] = []

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))

            if "attachment" in content_disposition:
                filename = part.get_filename()
                if filename:
                    filename = decode_mime_header(filename)
                else:
                    filename = "adjunto.bin"
                
                payload = part.get_payload(decode=True) or b""
                attachments.append({
                    "filename": filename,
                    "content_type": content_type,
                    "size_bytes": len(payload),
                    "data": payload
                })
            elif content_type == "text/plain" and not body_text:
                payload = part.get_payload(decode=True)
                if payload:
                    body_text = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
            elif content_type == "text/html" and not body_html:
                payload = part.get_payload(decode=True)
                if payload:
                    body_html = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True)
        if payload:
            text_str = payload.decode(msg.get_content_charset() or 'utf-8', errors='replace')
            if content_type == "text/html":
                body_html = text_str
            else:
                body_text = text_str

    if body_html:
        body_html = sanitize_html(body_html)

    raw_size_kb = round(len(raw_bytes) / 1024, 2)

    return {
        "subject": subject,
        "from_address": from_address,
        "body_text": body_text or "",
        "body_html": body_html or "",
        "raw_size_kb": raw_size_kb,
        "attachments": attachments
    }
