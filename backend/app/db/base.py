from app.core.database import Base
from app.db.models import Inbox, Message, Attachment, InboxRule, SupportTicket

__all__ = ["Base", "Inbox", "Message", "Attachment", "InboxRule", "SupportTicket"]
