from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import secrets

from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Active session in-memory store for active session tokens
# token -> { "username": str, "expires_at": datetime }
ACTIVE_SESSIONS: dict[str, dict] = {}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    expires_at: datetime
    expires_in_seconds: int

class VerifyResponse(BaseModel):
    valid: bool
    username: Optional[str] = None
    remaining_seconds: int

def clean_expired_sessions():
    now = datetime.now(timezone.utc)
    expired = [t for t, s in ACTIVE_SESSIONS.items() if s["expires_at"] < now]
    for t in expired:
        del ACTIVE_SESSIONS[t]

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    """Authenticate with username and password. Default demo user: demo / demo1234 (lifespan: 1 hour)."""
    clean_expired_sessions()
    
    # Check credentials
    is_valid = (
        payload.username.strip() == settings.DEMO_USER and
        payload.password == settings.DEMO_PASSWORD
    )
    
    # Also support admin / password if configured in env
    if not is_valid and hasattr(settings, "ADMIN_USER"):
        is_valid = (
            payload.username.strip() == getattr(settings, "ADMIN_USER", "") and
            payload.password == getattr(settings, "ADMIN_PASSWORD", "")
        )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Usa el usuario de prueba demo / demo1234."
        )

    # Generate 1-hour session token
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.SESSION_LIFESPAN_MINUTES)
    
    ACTIVE_SESSIONS[token] = {
        "username": payload.username.strip(),
        "expires_at": expires_at
    }

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        username=payload.username.strip(),
        expires_at=expires_at,
        expires_in_seconds=int((expires_at - now).total_seconds())
    )

@router.get("/verify/{token}", response_model=VerifyResponse)
async def verify_session(token: str):
    """Verify if the session token is valid and unexpired."""
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
        remaining_seconds=max(0, diff)
    )

@router.post("/logout/{token}")
async def logout(token: str):
    """Invalidate session token."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
    return {"message": "Sesión cerrada correctamente"}
