from typing import Optional
from pydantic import BaseModel, Field


class ProfileSwitchRequest(BaseModel):
    profile: str = Field(..., description="One of: maya, gamerz, techtara")


class VaultRequest(BaseModel):
    idea: str = Field(..., min_length=1)


class SandboxRequest(BaseModel):
    move: str = Field(..., min_length=1)


class SandboxChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    move: Optional[str] = None
