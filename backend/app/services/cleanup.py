import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy import delete, select, and_
from app.core.database import AsyncSessionLocal
from app.db.models import Inbox, Message
from app.core.config import settings
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logger = logging.getLogger("tempmail.cleanup")

scheduler = AsyncIOScheduler()

async def purge_expired_inboxes():
    """Purge unsaved messages from explicitly deleted inboxes older than 7 days."""
    logger.info("Executing scheduled cleanup of deleted inboxes...")
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    async with AsyncSessionLocal() as db:
        try:
            # Delete unsaved messages from inactive/deleted inboxes older than 7 days
            inactive_inboxes_subq = select(Inbox.id).where(Inbox.is_active == False, Inbox.created_at < cutoff)
            del_unsaved = delete(Message).where(
                Message.inbox_id.in_(inactive_inboxes_subq),
                Message.is_saved == False,  # noqa: E712
            )
            unsaved_result = await db.execute(del_unsaved)

            # Delete inactive inboxes that have NO saved messages left
            inboxes_with_saved = select(Message.inbox_id).where(
                Message.is_saved == True  # noqa: E712
            ).distinct()

            del_inboxes = delete(Inbox).where(
                Inbox.is_active == False,
                Inbox.created_at < cutoff,
                Inbox.id.not_in(inboxes_with_saved),
            )
            inbox_result = await db.execute(del_inboxes)

            await db.commit()
            if unsaved_result.rowcount > 0 or inbox_result.rowcount > 0:
                logger.info(
                    f"Purged {unsaved_result.rowcount} unsaved messages and "
                    f"{inbox_result.rowcount} deleted inboxes older than 7 days."
                )
        except Exception as e:
            logger.error(f"Error during inactive inbox cleanup: {e}")
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
