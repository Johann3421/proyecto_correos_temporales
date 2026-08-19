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
    # Add multi-inbox and forwarding columns to inboxes
    op.add_column('inboxes', sa.Column('session_owner', sa.String(length=128), nullable=True))
    op.add_column('inboxes', sa.Column('label', sa.String(length=100), nullable=True))
    op.add_column('inboxes', sa.Column('forward_to', sa.String(length=255), nullable=True))
    op.add_column('inboxes', sa.Column('forward_enabled', sa.Boolean(), nullable=False, server_default='false'))
    
    op.create_index(op.f('idx_inboxes_session_owner'), 'inboxes', ['session_owner'], unique=False)

    # Create inbox_rules table
    op.create_table(
        'inbox_rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('inbox_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('rule_type', sa.String(length=50), nullable=False),
        sa.Column('pattern', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False, server_default='notify_only'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['inbox_id'], ['inboxes.id'], ondelete='CASCADE'),
    )
    op.create_index(op.f('idx_rules_inbox_id'), 'inbox_rules', ['inbox_id'], unique=False)

    # Create support_tickets table
    op.create_table(
        'support_tickets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('session_token', sa.String(length=128), nullable=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

def downgrade() -> None:
    op.drop_table('support_tickets')
    op.drop_index(op.f('idx_rules_inbox_id'), table_name='inbox_rules')
    op.drop_table('inbox_rules')
    op.drop_index(op.f('idx_inboxes_session_owner'), table_name='inboxes')
    op.drop_column('inboxes', 'forward_enabled')
    op.drop_column('inboxes', 'forward_to')
    op.drop_column('inboxes', 'label')
    op.drop_column('inboxes', 'session_owner')
