from typing import Optional

from fastapi import HTTPException, Request

from backend.app.domain.security.roles import normalize_roles
from backend.app.infrastructure.security.jwt import JwtError, decode_token


def _extract_bearer(request: Request) -> Optional[str]:
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


async def tenant_context_middleware(request: Request, call_next):
    token = _extract_bearer(request)
    if token:
        try:
            payload = decode_token(
                token=token,
                secret=request.app.state.jwt_secret,
                algorithm=request.app.state.jwt_algorithm,
            )
        except JwtError:
            raise HTTPException(status_code=401, detail="Invalid token")

        request.state.user_id = payload.get("sub")
        request.state.clinic_id = payload.get("clinic_id") or request.app.state.default_clinic_id
        request.state.roles = normalize_roles(payload.get("roles"))

    return await call_next(request)

