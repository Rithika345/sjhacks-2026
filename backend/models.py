from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from db import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    google_sub = Column(String, unique=True, nullable=True)  # null for demo-mode users
    display_name = Column(String, nullable=False, default="Guest")
    is_demo = Column(Boolean, default=True, nullable=False)
    youtube_access_token = Column(String, nullable=True)
    current_profile_key = Column(String, nullable=False, default="maya")
    created_at = Column(DateTime, default=utcnow)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    vault_entries = relationship("VaultEntry", back_populates="user")
    sandbox_sessions = relationship("SandboxSession", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    """Persisted replacement for the old in-memory analysis_cache dict.
    One row per (user, profile) so switching profiles doesn't recompute."""
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    profile_key = Column(String, nullable=False)  # "maya" / "gamerz" / "techtara" / "real"
    metrics = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="analyses")


class VaultEntry(Base):
    """user_id is nullable and intentionally never exposed to other users —
    similarity checks compare against concept_tags across ALL entries, which
    is the point of Vault's anonymous design. user_id only exists so a real
    owner can be traced internally (e.g. for their own history), never shown
    to anyone else."""
    __tablename__ = "vault_entries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    idea_hash = Column(String, nullable=False)
    concept_tags = Column(JSON, nullable=False)
    certificate_jwt = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="vault_entries")


class SandboxSession(Base):
    __tablename__ = "sandbox_sessions"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    proposed_move = Column(String, nullable=False)
    report = Column(JSON, nullable=True)
    history = Column(JSON, default=list)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="sandbox_sessions")
