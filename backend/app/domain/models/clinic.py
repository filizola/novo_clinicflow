import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, EmailStr


class ClinicAddress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pais: Optional[str] = "BR"


class Clinic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome_fantasia: str
    razao_social: str
    cnpj: str
    endereco: ClinicAddress = Field(default_factory=ClinicAddress)
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

