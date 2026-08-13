import secrets
import string
import uuid

def generate_access_token() -> str:
    """Generate a secure, unguessable random access token (64 chars)."""
    return secrets.token_urlsafe(48)

def generate_random_email_prefix(length: int = 10) -> str:
    """Generate a random readable email prefix (lowercase letters & numbers)."""
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))
