"""add is_saved and saved_by_session to messages

Revision ID: 002_add_saved_fields
Revises: 001_initial_schema
Create Date: 2026-08-14
"""
from alembic import op
import sqlalchemy as sa

revision = '002_add_saved_fields'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('messages', sa.Column('is_saved', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('messages', sa.Column('saved_by_session', sa.String(128), nullable=True))

def downgrade() -> None:
    op.drop_column('messages', 'saved_by_session')
    op.drop_column('messages', 'is_saved')
