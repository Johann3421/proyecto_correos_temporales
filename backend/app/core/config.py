import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "TempMail API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/tempmail"
    )
    
    # Domains available for temp emails (comma-separated in env)
    DOMAINS_STR: str = os.getenv("DOMAINS", "tempmail.local,dispostable.dev")
    
    # Expiration Defaults
    DEFAULT_EXPIRATION_MINUTES: int = 10
    CLEANUP_INTERVAL_MINUTES: int = 5
    
    # SMTP Server Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "0.0.0.0")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "2525"))
    
    # Limits
    MAX_ATTACHMENT_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MAX_MESSAGES_PER_INBOX: int = 100
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    @property
    def domains(self) -> List[str]:
        return [d.strip() for d in self.DOMAINS_STR.split(",") if d.strip()]

    class Config:
        case_sensitive = True

settings = Settings()
