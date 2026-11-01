from typing import Literal

from pydantic import BaseModel


class Health(BaseModel):
    estado: Literal["ok"]
    version: str
