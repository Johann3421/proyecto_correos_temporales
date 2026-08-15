import logging
from datetime import datetime, timezone
from sqlalchemy import delete, select, and_
from app.core.database import AsyncSessionLocal
from app.db.models import Inbox, Message
from app.core.config import settings
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger("tempmail.cleanup")

scheduler = AsyncIOScheduler()

async def purge_expired_inboxes():
    """Delete expired inboxes but preserve saved messages."""
    logger.info("Executing scheduled cleanup of expired inboxes...")
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        try:
            # First: delete UNSAVED messages from expired inboxes
            expired_inboxes_subq = select(Inbox.id).where(Inbox.expires_at < now)
            del_unsaved = delete(Message).where(
                Message.inbox_id.in_(expired_inboxes_subq),
                Message.is_saved == False,  # noqa: E712
            )
            unsaved_result = await db.execute(del_unsaved)

            # Then: delete expired inboxes that have NO saved messages left
            inboxes_with_saved = select(Message.inbox_id).where(
                Message.is_saved == True  # noqa: E712
            ).distinct()

            del_inboxes = delete(Inbox).where(
                Inbox.expires_at < now,
                Inbox.id.not_in(inboxes_with_saved),
            )
            inbox_result = await db.execute(del_inboxes)

            # Deactivate expired inboxes that still have saved messages
            from sqlalchemy import update
            deactivate = (
                update(Inbox)
                .where(Inbox.expires_at < now, Inbox.is_active == True)  # noqa: E712
                .values(is_active=False)
            )
            await db.execute(deactivate)

            await db.commit()
            logger.info(
                f"Purged {unsaved_result.rowcount} unsaved messages and "
                f"{inbox_result.rowcount} empty expired inboxes."
            )
        except Exception as e:
            logger.error(f"Error during inbox cleanup purge: {e}")
            await db.rollback()

def start_cleanup_scheduler():
    scheduler.add_job(
        purge_expired_inboxes,
        'interval',
        minutes=settings.CLEANUP_INTERVAL_MINUTES,
        id='purge_expired_inboxes',
        replace_existing=True
    )
    scheduler.start()
    logger.info(f"Cleanup scheduler started running every {settings.CLEANUP_INTERVAL_MINUTES} minutes.")
