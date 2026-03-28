from backend.app.infrastructure.security.jwt import decode_token, create_access_token


def test_jwt_contains_clinic_id_and_roles():
    token = create_access_token(
        secret="test",
        algorithm="HS256",
        expiration_minutes=10,
        user_id="u1",
        clinic_id="c1",
        roles=["ADMIN_CLINIC"],
        extra={"email": "a@b.com"},
    )
    payload = decode_token(token=token, secret="test", algorithm="HS256")
    assert payload["sub"] == "u1"
    assert payload["clinic_id"] == "c1"
    assert payload["roles"] == ["ADMIN_CLINIC"]
    assert payload["email"] == "a@b.com"

