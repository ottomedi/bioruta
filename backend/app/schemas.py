from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class Health(BaseModel):
    estado: Literal["ok"]
    version: str


class Coordenadas(BaseModel):
    latitud: float
    longitud: float


class Veterinario(BaseModel):
    id: int
    nombre: str
    base: Coordenadas


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class Token(BaseModel):
    access_token: str
    token_type: Literal["bearer"]  # sin valor por defecto: el contrato lo marca como obligatorio


class Usuario(BaseModel):
    id: int
    email: EmailStr
    veterinario: Veterinario
