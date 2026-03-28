import os
from datetime import datetime, timezone
from typing import Iterable

from motor.motor_asyncio import AsyncIOMotorClient


DEFAULT_COLLECTIONS: list[str] = [
    "users",
    "professionals",
    "services",
    "rooms",
    "patients",
    "appointments",
    "transactions",
    "medical_records",
    "leads",
    "conversations",
    "messages",
    "follow_ups",
    "follow_up_rules",
    "settings",
]


async def _ensure_clinic_default(db, clinic_id: str):
    now = datetime.now(timezone.utc).isoformat()
    await db.clinics.update_one(
        {"id": clinic_id},
        {
            "$setOnInsert": {
                "id": clinic_id,
                "nome_fantasia": "Clínica Padrão",
                "razao_social": "Clínica Padrão",
                "cnpj": "00000000000000",
                "endereco": {},
                "telefone": None,
                "email": None,
                "status": "active",
                "created_at": now,
                "updated_at": now,
            }
        },
        upsert=True,
    )


async def _backfill_collection(db, collection: str, clinic_id: str):
    await db[collection].update_many(
        {"clinic_id": {"$exists": False}},
        {"$set": {"clinic_id": clinic_id}},
    )


async def _ensure_indexes(db, collections: Iterable[str]):
    await db.clinics.create_index([("id", 1)], unique=True)
    await db.clinics.create_index([("cnpj", 1)])
    for name in collections:
        await db[name].create_index([("clinic_id", 1)])
        await db[name].create_index([("clinic_id", 1), ("id", 1)])


async def run():
    mongo_url = os.environ.get("MONGO_URL", "").strip()
    db_name = os.environ.get("DB_NAME", "clinicflow").strip()
    default_clinic_id = os.environ.get("DEFAULT_CLINIC_ID", "00000000-0000-0000-0000-000000000000").strip()

    if not mongo_url:
        raise RuntimeError("MONGO_URL not set")

    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client.get_database(db_name)
    client.admin.command("ping")

    await _ensure_clinic_default(db, default_clinic_id)
    for c in DEFAULT_COLLECTIONS:
        await _backfill_collection(db, c, default_clinic_id)
    await _ensure_indexes(db, DEFAULT_COLLECTIONS)

    client.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(run())

