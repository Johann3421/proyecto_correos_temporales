import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import inbox, websocket
from app.services.smtp_server import start_smtp_server
from app.services.cleanup import start_cleanup_scheduler

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("tempmail")

smtp_controller = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global smtp_controller
    logger.info("Starting TempMail FastAPI service...")
    
    # Start background cleanup job
    start_cleanup_scheduler()
    
    # Start SMTP receiver server
    try:
        smtp_controller = start_smtp_server()
    except Exception as e:
        logger.error(f"Could not start SMTP server: {e}")

    yield

    logger.info("Shutting down TempMail FastAPI service...")
    if smtp_controller:
        smtp_controller.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(inbox.router, prefix=settings.API_PREFIX)
app.include_router(websocket.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME, "version": settings.VERSION}
