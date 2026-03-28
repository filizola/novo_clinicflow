# Ambiente Docker local (100% local)

## Serviços e portas
- **MongoDB**: `localhost:27017`
- **Backend (FastAPI/Uvicorn)**: `localhost:8000`
- **Frontend (Nginx + React build)**: `http://localhost:3000`

## Serviços (compose)
- **mongodb**
  - Container: `clinicflow-mongodb-mongodb`
  - Porta host: `27017 -> 27017`
  - Volume: `mongodb_data:/data/db`
  - Rede: `clinicflow`
- **backend**
  - Container: `clinicflow-mongodb-backend`
  - Porta host: `8000 -> 8000`
  - Rede: `clinicflow`
- **frontend**
  - Container: `clinicflow-mongodb-frontend`
  - Porta host: `3000 -> 80`
  - Rede: `clinicflow`

## Imagens (todas com prefixo obrigatório)
- `clinicflow-mongodb-mongodb:local`
- `clinicflow-mongodb-backend:local`
- `clinicflow-mongodb-frontend:local`

## Subir o ambiente

```bash
docker compose up --build
```

## Conexões entre containers
- `frontend` -> `backend` via Nginx proxy:
  - `/api/*` -> `http://backend:8000/api/*`
  - `/socket.io/*` -> `http://backend:8000/socket.io/*`
- `backend` -> `mongodb` via `MONGO_URL=mongodb://mongodb:27017`

## Variáveis de ambiente (backend)
- `MONGO_URL`: `mongodb://mongodb:27017` (dentro do Docker)
- `DB_NAME`: `clinicflow`
- `JWT_SECRET_KEY`: obrigatório (carregado de `.env`, não commitar)
- `DEFAULT_CLINIC_ID`: `00000000-0000-0000-0000-000000000000`
- `MULTITENANT_ENFORCE`:
  - `0`: compatibilidade (tenant default enxerga docs sem `clinic_id`)
  - `1`: isolamento estrito (sem shadow reads)
- `MASTER_ADMIN_EMAILS`: lista (separada por vírgula) de emails com `ADMIN_MASTER`

## Ambiente “host” (opcional, ainda 100% local)
Se você quiser rodar backend/frontend no host e usar apenas o MongoDB no Docker:
- MongoDB continua em `mongodb://localhost:27017`
- Backend no host deve usar `MONGO_URL=mongodb://localhost:27017`
- Frontend no host pode usar `REACT_APP_BACKEND_URL=http://localhost:8000`

## Acesso via host (localhost)
- A aplicação está “local-only”: todas as portas são expostas para `localhost`.
- MongoDB pode ser acessado no host em `mongodb://localhost:27017`.
