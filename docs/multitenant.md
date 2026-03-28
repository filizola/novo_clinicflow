# Multi-tenant (SaaS) – migração incremental

## Objetivo
- Migrar de single-tenant para multi-tenant com isolamento lógico por `clinic_id` (MongoDB compartilhado).
- Evitar vazamento de dados por padrão: toda query/write passa por filtro de tenant.

## Conceitos
- **Tenant/Clínica**: documento em `clinics` com `id` (UUID) e dados cadastrais.
- **Escopo de dados**: todas as entidades persistidas têm `clinic_id`.
- **Tenant context**: obtido do JWT em toda requisição autenticada.

## Feature flags / variáveis
- `DEFAULT_CLINIC_ID`: UUID da clínica padrão para migrar dados existentes.
- `MULTITENANT_ENFORCE` (`0|1`): quando `0`, leituras do tenant default aceitam docs sem `clinic_id` (modo compatível).
- `MASTER_ADMIN_EMAILS`: lista separada por vírgula (emails) que recebem `ADMIN_MASTER` no token.
- `JWT_SECRET_KEY`: obrigatório (ou `ALLOW_INSECURE_JWT_SECRET=1` apenas para dev).

## Estratégia de rollout (zero downtime sempre que possível)
### Fase 0 – preparação (compatível)
- Deploy do backend com:
  - JWT contendo `clinic_id` e `roles` (mantém compatibilidade com tokens antigos).
  - Queries isoladas por `clinic_id`.
  - Shadow reads para `DEFAULT_CLINIC_ID` quando `MULTITENANT_ENFORCE=0`.

### Fase 1 – migração de dados (idempotente)
- Executar o script:
  - `python backend/migrations/001_multitenant_clinics.py`
- O script:
  - cria a clínica default (se não existir)
  - faz backfill de `clinic_id` em coleções existentes
  - cria índices por `clinic_id`

### Fase 2 – enforcement
- Ajustar `MULTITENANT_ENFORCE=1`
- A partir daqui, todo acesso fica estritamente isolado e docs sem `clinic_id` deixam de ser visíveis (exceto se ainda existirem e você voltar para `0` apenas para tenant default).

## Rollback
- Rollback “seguro” (sem voltar versão): colocar `MULTITENANT_ENFORCE=0` para permitir shadow reads apenas no tenant default.
- Evitar rollback para versões antigas que não filtram por tenant, pois isso reintroduz risco de vazamento.

## Socket.IO
- Cada conexão é autenticada via JWT.
- A conexão entra no room: `clinic_{clinic_id}`.
- Emissões devem sempre usar `room=clinic_{clinic_id}`.

