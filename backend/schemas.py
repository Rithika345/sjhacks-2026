from typing import Optional
from pydantic import BaseModel, Field


class ProfileSwitchRequest(BaseModel):
    profile: str = Field(..., description="One of: maya, gamerz, techtara")


class VaultRequest(BaseModel):
    # max_length matters even with rate limiting on this route: without it,
    # a single request within the allowed rate could still be a huge wall
    # of text, which costs just as much in Anthropic tokens as many small
    # ones would.
    idea: str = Field(..., min_length=1, max_length=2000)


class SandboxRequest(BaseModel):
    move: str = Field(..., min_length=1, max_length=2000)


class SandboxChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    move: Optional[str] = Field(None, max_length=2000)
