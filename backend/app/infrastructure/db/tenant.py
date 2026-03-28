from typing import Any, Dict, Optional


def tenant_match(
    clinic_id: str,
    base_filter: Optional[Dict[str, Any]] = None,
    *,
    shadow_default_clinic_id: Optional[str] = None,
) -> Dict[str, Any]:
    base_filter = dict(base_filter or {})
    if "clinic_id" in base_filter:
        return base_filter
    if shadow_default_clinic_id and clinic_id == shadow_default_clinic_id:
        clinic_clause: Dict[str, Any] = {
            "$or": [{"clinic_id": clinic_id}, {"clinic_id": {"$exists": False}}],
        }
    else:
        clinic_clause = {"clinic_id": clinic_id}
    if not base_filter:
        return clinic_clause
    return {"$and": [clinic_clause, base_filter]}


def enforce_no_clinic_id_mutation(update: Dict[str, Any]) -> Dict[str, Any]:
    update = dict(update or {})
    if "$set" in update and isinstance(update["$set"], dict):
        update["$set"] = dict(update["$set"])
        update["$set"].pop("clinic_id", None)
    return update


async def tenant_find_one(
    collection,
    *,
    clinic_id: str,
    base_filter: Optional[Dict[str, Any]] = None,
    projection: Optional[Dict[str, Any]] = None,
    shadow_default_clinic_id: Optional[str] = None,
):
    return await collection.find_one(
        tenant_match(clinic_id, base_filter, shadow_default_clinic_id=shadow_default_clinic_id),
        projection,
    )


def tenant_find(
    collection,
    *,
    clinic_id: str,
    base_filter: Optional[Dict[str, Any]] = None,
    projection: Optional[Dict[str, Any]] = None,
    shadow_default_clinic_id: Optional[str] = None,
):
    return collection.find(
        tenant_match(clinic_id, base_filter, shadow_default_clinic_id=shadow_default_clinic_id),
        projection,
    )


async def tenant_insert_one(collection, *, clinic_id: str, doc: Dict[str, Any]):
    doc = dict(doc)
    doc["clinic_id"] = clinic_id
    return await collection.insert_one(doc)


async def tenant_update_one(
    collection,
    *,
    clinic_id: str,
    base_filter: Dict[str, Any],
    update: Dict[str, Any],
    upsert: bool = False,
    shadow_default_clinic_id: Optional[str] = None,
):
    update = enforce_no_clinic_id_mutation(update)
    if upsert:
        update = dict(update)
        soi = update.get("$setOnInsert")
        if not isinstance(soi, dict):
            soi = {}
        soi = dict(soi)
        soi.setdefault("clinic_id", clinic_id)
        update["$setOnInsert"] = soi

    return await collection.update_one(
        tenant_match(clinic_id, base_filter, shadow_default_clinic_id=shadow_default_clinic_id),
        update,
        upsert=upsert,
    )


async def tenant_delete_one(
    collection,
    *,
    clinic_id: str,
    base_filter: Dict[str, Any],
    shadow_default_clinic_id: Optional[str] = None,
):
    return await collection.delete_one(
        tenant_match(clinic_id, base_filter, shadow_default_clinic_id=shadow_default_clinic_id)
    )

