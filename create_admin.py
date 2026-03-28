#!/usr/bin/env python3
"""
Script para criar usuário administrador no CliniFlow
Uso: python3 create_admin.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import argparse
from dotenv import load_dotenv
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid

# Load environment
try:
    load_dotenv('/app/backend/.env')
except Exception:
    pass
load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin(email: str, password: str, name: str):
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017').strip()
    db_name = os.environ.get('DB_NAME', 'clinicflow').strip()
    default_clinic_id = os.environ.get("DEFAULT_CLINIC_ID", "00000000-0000-0000-0000-000000000000").strip()
    create_master_admin = os.environ.get("CREATE_MASTER_ADMIN", "0").strip() == "1"
    
    if not mongo_url or not db_name:
        print("❌ ERRO: MONGO_URL ou DB_NAME não configurados no .env")
        return
    
    print(f"🔗 Conectando ao banco: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    now = datetime.now(timezone.utc).isoformat()
    await db.clinics.update_one(
        {"id": default_clinic_id},
        {
            "$setOnInsert": {
                "id": default_clinic_id,
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
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({'email': email, "clinic_id": default_clinic_id}, {'_id': 0})
    
    if existing_admin:
        print("⚠️  Usuário administrador já existe!")
        print(f"   Email: {email}")
        print(f"   Nome atual: {existing_admin.get('name')}")
        
        hashed = pwd_context.hash(password)
        await db.users.update_one(
            {'email': email, "clinic_id": default_clinic_id},
            {'$set': {'password_hash': hashed, 'name': name, 'role.is_admin': True, 'user_type': 'admin', 'roles': (["ADMIN_MASTER"] if create_master_admin else ["ADMIN_CLINIC"])}}
        )
        print(f"✅ Senha redefinida e perfil atualizado!")
        print(f"   Email: {email}")
        print(f"   Senha: {password}")
    else:
        # Create new admin
        hashed = pwd_context.hash(password)
        
        admin_user = {
            "id": str(uuid.uuid4()),
            "clinic_id": default_clinic_id,
            "name": name,
            "email": email,
            "password_hash": hashed,
            "role": {
                "is_admin": True,
                "is_attendant": False
            },
            "roles": ["ADMIN_MASTER"] if create_master_admin else ["ADMIN_CLINIC"],
            "user_type": "admin",
            "professional_id": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        
        print("✅ Administrador criado com sucesso!")
        print(f"   Email: {email}")
        print(f"   Senha: {password}")
        print("\n⚠️  IMPORTANTE: Altere esta senha após o primeiro login!")
    
    client.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🏥 CliniFlow - Criar Usuário Administrador")
    print("=" * 60)
    print()
    
    parser = argparse.ArgumentParser(description="Criar/atualizar usuário administrador")
    parser.add_argument("--email", type=str, help="Email do administrador")
    parser.add_argument("--password", type=str, help="Senha do administrador")
    parser.add_argument("--name", type=str, help="Nome do administrador")
    args = parser.parse_args()
    
    email = args.email or os.environ.get("ADMIN_EMAIL") or "admin@cliniflow.com"
    password = args.password or os.environ.get("ADMIN_PASSWORD")
    if not password:
        print("❌ ERRO: informe --password ou defina ADMIN_PASSWORD")
        raise SystemExit(1)
    name = args.name or os.environ.get("ADMIN_NAME") or "Administrador"
    
    asyncio.run(create_admin(email=email, password=password, name=name))
    
    print()
    print("=" * 60)
