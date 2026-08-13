"""Initial schema for inboxes, messages, attachments

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-12 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'inboxes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email_address', sa.String(length=255), nullable=False),
        sa.Column('access_token', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('idx_inboxes_email'), 'inboxes', ['email_address'], unique=True)
    op.create_index(op.f('idx_inboxes_token'), 'inboxes', ['access_token'], unique=True)
    op.create_index(op.f('idx_inboxes_expires'), 'inboxes', ['expires_at'], unique=False)

    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('inbox_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('from_address', sa.String(length=255), nullable=False),
        sa.Column('subject', sa.String(length=500), nullable=False, server_default=''),
        sa.Column('body_text', sa.Text(), nullable=False, server_default=''),
        sa.Column('body_html', sa.Text(), nullable=False, server_default=''),
        sa.Column('received_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('raw_size_kb', sa.Float(), nullable=False, server_default='0.0'),
        sa.ForeignKeyConstraint(['inbox_id'], ['inboxes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('idx_messages_inbox_id'), 'messages', ['inbox_id'], unique=False)

    op.create_table(
        'attachments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('content_type', sa.String(length=100), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('data', sa.LargeBinary(), nullable=True),
        sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('idx_attachments_message_id'), 'attachments', ['message_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('idx_attachments_message_id'), table_name='attachments')
    op.drop_table('attachments')
    op.drop_index(op.f('idx_messages_inbox_id'), table_name='messages')
    op.drop_table('messages')
    op.drop_index(op.f('idx_inboxes_expires'), table_name='inboxes')
    op.drop_index(op.f('idx_inboxes_token'), table_name='inboxes')
    op.drop_index(op.f('idx_inboxes_email'), table_name='inboxes')
    op.drop_table('inboxes')
