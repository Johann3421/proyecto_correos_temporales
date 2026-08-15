from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import secrets

from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Active session in-memory store
# token -> { "username": str, "role": str, "expires_at": datetime }
ACTIVE_SESSIONS: dict[str, dict] = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str
    expires_at: datetime
    expires_in_seconds: int

class VerifyResponse(BaseModel):
    valid: bool
    username: Optional[str] = None
    role: Optional[str] = None
    remaining_seconds: int

def clean_expired_sessions():
    now = datetime.now(timezone.utc)
    expired = [t for t, s in ACTIVE_SESSIONS.items() if s["expires_at"] < now]
    for t in expired:
        del ACTIVE_SESSIONS[t]

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    """Authenticate with username and password (Supports demo / demo1234 and admin / admin1234)."""
    clean_expired_sessions()
    
    username = payload.username.strip().lower()
    password = payload.password
    
    role = None
    lifespan_minutes = settings.SESSION_LIFESPAN_MINUTES  # default 60 min

    # Check admin
    if username == settings.ADMIN_USER.lower() and password == settings.ADMIN_PASSWORD:
        role = "admin"
        lifespan_minutes = settings.ADMIN_SESSION_LIFESPAN_HOURS * 60
    # Check demo
    elif username == settings.DEMO_USER.lower() and password == settings.DEMO_PASSWORD:
        role = "demo"
        lifespan_minutes = settings.SESSION_LIFESPAN_MINUTES
        
    if not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas."
        )

    # Generate session token
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=lifespan_minutes)
    
    ACTIVE_SESSIONS[token] = {
        "username": username,
        "role": role,
        "expires_at": expires_at
    }

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        username=username,
        role=role,
        expires_at=expires_at,
        expires_in_seconds=int((expires_at - now).total_seconds())
    )

@router.get("/verify/{token}", response_model=VerifyResponse)
async def verify_session(token: str):
    """Verify if session token is valid."""
    clean_expired_sessions()
    session = ACTIVE_SESSIONS.get(token)
    if not session:
        return VerifyResponse(valid=False, remaining_seconds=0)

    now = datetime.now(timezone.utc)
    if session["expires_at"] < now:
        del ACTIVE_SESSIONS[token]
        return VerifyResponse(valid=False, remaining_seconds=0)

    diff = int((session["expires_at"] - now).total_seconds())
    return VerifyResponse(
        valid=True,
        username=session["username"],
        role=session.get("role", "user"),
        remaining_seconds=max(0, diff)
    )

@router.post("/logout/{token}")
async def logout(token: str):
    """Invalidate session token."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
    return {"message": "Sesión cerrada correctamente"}
