import logging
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import delete
from app.core.database import AsyncSessionLocal
from app.db.models import Inbox
from app.core.config import settings

logger = logging.getLogger("tempmail.cleanup")

scheduler = AsyncIOScheduler()

async def purge_expired_inboxes():
    logger.info("Executing scheduled cleanup of expired inboxes...")
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as db:
        try:
            stmt = delete(Inbox).where(Inbox.expires_at < now)
            result = await db.execute(stmt)
            await db.commit()
            logger.info(f"Purged {result.rowcount} expired inboxes and their messages.")
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
