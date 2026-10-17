"""Initial database for retinal fundus research prototype.

Revision ID: 001_initial_dr
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = '001_initial_dr'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_table('scans',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('dataset', sa.String(255), nullable=False),
        sa.Column('ground_truth_grade', sa.Integer(), nullable=True),
        sa.Column('eye_side', sa.String(10), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_name', sa.String(255), nullable=True, unique=True),
        sa.Column('predicted_grade', sa.Integer(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('image_path', sa.String(255), nullable=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    for name in ['title','dataset','ground_truth_grade','owner_id']:
        op.create_index(f'ix_scans_{name}', 'scans', [name])

def downgrade():
    op.drop_table('scans')
    op.drop_table('users')
