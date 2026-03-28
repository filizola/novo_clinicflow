from typing import Callable, Optional, Set

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.domain.security.roles import normalize_roles
from backend.app.infrastructure.security.jwt import JwtError, decode_token


security = HTTPBearer()


def get_current_tenant(request: Request) -> str:
    clinic_id = getattr(request.state, "clinic_id", None)
    if not clinic_id:
        raise HTTPException(status_code=401, detail="Tenant not resolved")
    return str(clinic_id)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials
    secret = request.app.state.jwt_secret
    algorithm = request.app.state.jwt_algorithm
    try:
        payload = decode_token(token=token, secret=secret, algorithm=algorithm)
    except JwtError as e:
        raise HTTPException(status_code=401, detail=str(e))

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    clinic_id = payload.get("clinic_id") or request.app.state.default_clinic_id
    roles = normalize_roles(payload.get("roles"))

    request.state.user_id = user_id
    request.state.clinic_id = clinic_id
    request.state.roles = roles

    db = request.app.state.db
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    shadow_default = request.app.state.shadow_default_clinic_id
    user = await db.users.find_one({"id": user_id, "clinic_id": clinic_id}, {"_id": 0})
    if user is None and shadow_default and clinic_id == shadow_default:
        user = await db.users.find_one({"id": user_id, "clinic_id": {"$exists": False}}, {"_id": 0})

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    if "clinic_id" not in user:
        user = dict(user)
        user["clinic_id"] = clinic_id
    if "roles" not in user:
        user = dict(user)
        user["roles"] = list(roles)
    return user


def require_roles(*required: str) -> Callable:
    required_set: Set[str] = set(required)

    async def _dep(current_user: dict = Depends(get_current_user)):
        roles = normalize_roles(current_user.get("roles"))
        if required_set and roles.isdisjoint(required_set):
            raise HTTPException(status_code=403, detail="Not authorized")
        return current_user

    return _dep

