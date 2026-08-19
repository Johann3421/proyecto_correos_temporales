import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        extra="ignore",
        case_sensitive=False,
        env_file=".env",
        env_file_encoding="utf-8"
    )

    PROJECT_NAME: str = "TempMail API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+asyncpg://postgres:postgres@localhost:5432/tempmail"
    )
    
    # Domains available for temp emails (comma-separated in env)
    DOMAINS_STR: str = os.getenv("DOMAINS", "correos.abadgroup.tech,abadgroup.tech")
    
    # Enable dynamic wildcard subdomains (e.g. user@x7k.correos.abadgroup.tech)
    ENABLE_RANDOM_SUBDOMAINS: bool = os.getenv("ENABLE_RANDOM_SUBDOMAINS", "true").lower() in ("true", "1", "yes")
    
    # Maintenance / Cleanup Interval (Minutes)
    CLEANUP_INTERVAL_MINUTES: int = int(os.getenv("CLEANUP_INTERVAL_MINUTES", "60"))
    
    # Authentication (Demo User & Admin User)
    AUTH_ENABLED: bool = os.getenv("AUTH_ENABLED", "true").lower() in ("true", "1", "yes")
    DEMO_USER: str = os.getenv("DEMO_USER", "demo")
    DEMO_PASSWORD: str = os.getenv("DEMO_PASSWORD", "demo1234")
    ADMIN_USER: str = os.getenv("ADMIN_USER", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin1234")
    SESSION_LIFESPAN_MINUTES: int = int(os.getenv("SESSION_LIFESPAN_MINUTES", "60"))  # 1 hour for demo
    ADMIN_SESSION_LIFESPAN_HOURS: int = int(os.getenv("ADMIN_SESSION_LIFESPAN_HOURS", "24"))  # 24 hours for admin
    SECRET_KEY: str = os.getenv("SECRET_KEY", "abadgroup_secure_jwt_token_auth_key_2026")
    
    # SMTP Server Settings
    SMTP_HOST: str = os.getenv("SMTP_HOST", "0.0.0.0")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "2525"))
    
    # Outbound Email Forwarding (Relay to Gmail/Outlook)
    FORWARD_SMTP_HOST: str = os.getenv("FORWARD_SMTP_HOST", "")
    FORWARD_SMTP_PORT: int = int(os.getenv("FORWARD_SMTP_PORT", "587"))
    FORWARD_SMTP_USER: str = os.getenv("FORWARD_SMTP_USER", "")
    FORWARD_SMTP_PASSWORD: str = os.getenv("FORWARD_SMTP_PASSWORD", "")
    FORWARD_SMTP_USE_TLS: bool = os.getenv("FORWARD_SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
    FORWARD_FROM_EMAIL: str = os.getenv("FORWARD_FROM_EMAIL", "relay@correos.abadgroup.tech")
    
    # Support
    SUPPORT_NOTIFICATION_EMAIL: str = os.getenv("SUPPORT_NOTIFICATION_EMAIL", "support@abadgroup.tech")

    # Limits
    MAX_INBOXES_PER_USER: int = int(os.getenv("MAX_INBOXES_PER_USER", "10"))
    MAX_ATTACHMENT_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    MAX_MESSAGES_PER_INBOX: int = 100
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    @property
    def domains(self) -> List[str]:
        return [d.strip() for d in self.DOMAINS_STR.split(",") if d.strip()]

settings = Settings()
