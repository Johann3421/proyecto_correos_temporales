"""Add multi-inbox, forward_to, inbox_rules, and support_tickets

Revision ID: 003_advanced_features
Revises: 002_add_saved_fields
Create Date: 2026-08-19
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '003_advanced_features'
down_revision = '002_add_saved_fields'
branch_labels = None
depends_on = None

def upgrade() -> None:
    conn = op.get_bind()

    # Safe column additions on inboxes
    conn.execute(sa.text("ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS session_owner VARCHAR(128);"))
    conn.execute(sa.text("ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS label VARCHAR(100);"))
    conn.execute(sa.text("ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS forward_to VARCHAR(255);"))
    conn.execute(sa.text("ALTER TABLE inboxes ADD COLUMN IF NOT EXISTS forward_enabled BOOLEAN NOT NULL DEFAULT false;"))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_inboxes_session_owner ON inboxes (session_owner);"))

    # Safe creation of inbox_rules table
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS inbox_rules (
            id UUID PRIMARY KEY,
            inbox_id UUID NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
            rule_type VARCHAR(50) NOT NULL,
            pattern VARCHAR(255) NOT NULL,
            action VARCHAR(50) NOT NULL DEFAULT 'notify_only',
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """))
    conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_rules_inbox_id ON inbox_rules (inbox_id);"))

    # Safe creation of support_tickets table
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS support_tickets (
            id UUID PRIMARY KEY,
            session_token VARCHAR(128),
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """))

def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS support_tickets;"))
    conn.execute(sa.text("DROP TABLE IF EXISTS inbox_rules;"))
    conn.execute(sa.text("DROP INDEX IF EXISTS idx_inboxes_session_owner;"))
    conn.execute(sa.text("ALTER TABLE inboxes DROP COLUMN IF EXISTS forward_enabled;"))
    conn.execute(sa.text("ALTER TABLE inboxes DROP COLUMN IF EXISTS forward_to;"))
    conn.execute(sa.text("ALTER TABLE inboxes DROP COLUMN IF EXISTS label;"))
    conn.execute(sa.text("ALTER TABLE inboxes DROP COLUMN IF EXISTS session_owner;"))
