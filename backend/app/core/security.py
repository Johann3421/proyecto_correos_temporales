import secrets
import string

def generate_access_token() -> str:
    """Generate a secure, unguessable random access token (64 chars)."""
    return secrets.token_urlsafe(48)

def generate_random_email_prefix(length: int = 8) -> str:
    """Generate a random readable email prefix (lowercase letters & numbers)."""
    chars = string.ascii_lowercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_random_subdomain() -> str:
    """Generate realistic/obfuscated subdomains like x7k, box-42, relay-8, mx-9, alpha-3."""
    patterns = [
        # Pattern 1: 3-4 alphanumeric chars (e.g., k9x, v3m1, q8z)
        lambda: ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(secrets.choice([3, 4]))),
        # Pattern 2: tech slug + number (e.g., node-7, relay-88, gw-5, box-12)
        lambda: f"{secrets.choice(['node', 'relay', 'gw', 'box', 'hub', 'link', 'mx', 'edge', 'mail'])}-{secrets.choice(range(1, 99))}",
        # Pattern 3: word pair (e.g., fast-net, secure-box, swift-in)
        lambda: f"{secrets.choice(['fast', 'swift', 'cloud', 'host', 'safe', 'open', 'drop'])}-{secrets.choice(['box', 'mail', 'in', 'post', 'net', 'run'])}",
    ]
    generator = secrets.choice(patterns)
    return generator()
