from enum import Enum
from typing import Iterable, Set


class Role(str, Enum):
    ADMIN_MASTER = "ADMIN_MASTER"
    ADMIN_CLINIC = "ADMIN_CLINIC"
    DENTISTA = "DENTISTA"
    RECEPCIONISTA = "RECEPCIONISTA"
    ASSISTENTE = "ASSISTENTE"


def normalize_roles(raw_roles: object) -> Set[str]:
    if raw_roles is None:
        return set()
    if isinstance(raw_roles, str):
        return {raw_roles}
    if isinstance(raw_roles, Iterable):
        return {str(r) for r in raw_roles if r is not None and str(r).strip() != ""}
    return {str(raw_roles)}

