from backend.app.infrastructure.db.tenant import enforce_no_clinic_id_mutation, tenant_match


def test_tenant_match_injects_clinic_id():
    f = tenant_match("c1", {"id": "x"})
    assert "$and" in f
    assert f["$and"][0] == {"clinic_id": "c1"}


def test_tenant_match_shadow_allows_missing_for_default():
    f = tenant_match("default", {"id": "x"}, shadow_default_clinic_id="default")
    assert "$and" in f
    assert "$or" in f["$and"][0]


def test_enforce_no_clinic_id_mutation_removes_set():
    update = {"$set": {"clinic_id": "bad", "name": "ok"}}
    cleaned = enforce_no_clinic_id_mutation(update)
    assert cleaned["$set"].get("clinic_id") is None
    assert cleaned["$set"]["name"] == "ok"

