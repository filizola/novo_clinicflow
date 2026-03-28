from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt


class JwtError(Exception):
    pass


def create_access_token(
    *,
    secret: str,
    algorithm: str,
    expiration_minutes: int,
    user_id: str,
    clinic_id: str,
    roles: list[str],
    extra: Optional[Dict[str, Any]] = None,
) -> str:
    payload: Dict[str, Any] = {"sub": user_id, "clinic_id": clinic_id, "roles": roles}
    if extra:
        payload.update(extra)
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expiration_minutes)
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_token(*, token: str, secret: str, algorithm: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, secret, algorithms=[algorithm])
    except jwt.ExpiredSignatureError as e:
        raise JwtError("Token has expired") from e
    except jwt.InvalidTokenError as e:
        raise JwtError("Invalid token") from e

