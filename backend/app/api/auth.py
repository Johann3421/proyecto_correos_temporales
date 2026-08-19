import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import secrets

from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Active session in-memory store
# token -> { "username": str, "role": str, "expires_at": datetime }
ACTIVE_SESSIONS: Dict[str, dict] = {}

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

def get_valid_accounts() -> Dict[str, dict]:
    """
    Returns a dictionary of valid username -> { password, role, lifespan_hours }
    Includes admin, admin2, johan, demo, and any custom accounts defined in AUTH_USERS.
    """
    accounts = {
        settings.ADMIN_USER.lower(): {
            "password": settings.ADMIN_PASSWORD,
            "role": "admin",
            "lifespan_hours": settings.ADMIN_SESSION_LIFESPAN_HOURS,
        },
        "admin2": {
            "password": os.getenv("ADMIN2_PASSWORD", "admin12345"),
            "role": "admin",
            "lifespan_hours": settings.ADMIN_SESSION_LIFESPAN_HOURS,
        },
        "johan": {
            "password": os.getenv("JOHAN_PASSWORD", "johan1234"),
            "role": "admin",
            "lifespan_hours": settings.ADMIN_SESSION_LIFESPAN_HOURS,
        },
        settings.DEMO_USER.lower(): {
            "password": settings.DEMO_PASSWORD,
            "role": "demo",
            "lifespan_hours": max(1, settings.SESSION_LIFESPAN_MINUTES // 60),
        },
    }

    # Support custom env-defined accounts: AUTH_USERS="user1:pass1:admin,user2:pass2:demo"
    auth_users_env = os.getenv("AUTH_USERS", "")
    if auth_users_env:
        for entry in auth_users_env.split(","):
            parts = entry.strip().split(":")
            if len(parts) >= 2:
                u = parts[0].strip().lower()
                p = parts[1].strip()
                r = parts[2].strip().lower() if len(parts) > 2 else "user"
                accounts[u] = {
                    "password": p,
                    "role": r,
                    "lifespan_hours": settings.ADMIN_SESSION_LIFESPAN_HOURS if r == "admin" else 2,
                }

    return accounts

@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    """Authenticate with username and password (Supports admin, admin2, johan, demo)."""
    clean_expired_sessions()
    
    username = payload.username.strip().lower()
    password = payload.password
    
    accounts = get_valid_accounts()
    account_info = accounts.get(username)

    if not account_info or account_info["password"] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas."
        )

    role = account_info["role"]
    lifespan_hours = account_info.get("lifespan_hours", 24)

    # Generate isolated session token
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=lifespan_hours)
    
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
