# Backend plan: Payload + Postgres + Redis

## Goals
- Run Payload CMS as the primary backend for payroll data, admin workflows, and API access.
- Use Postgres as the source of truth for structured data.
- Introduce Redis for caching, background jobs, and rate limiting.

## Architecture overview
- **Payload** (Node.js) provides:
  - Admin UI and content modeling.
  - REST and GraphQL APIs.
  - Authentication and role-based access control.
- **Postgres** stores all canonical payroll data.
- **Redis** supports:
  - Cache for hot reads (employee profiles, payroll calendars).
  - Background job queues (payroll processing, statement generation).
  - Request throttling (admin APIs and public endpoints).

## Proposed services
- `payload` application service (new).
- `db` Postgres service (already defined in `docker-compose.yml`).
- `redis` service (new).

## Local development setup
1. **Add Payload dependencies**
   - `payload`, `@payloadcms/db-postgres`, `express`, `dotenv` (or similar runtime requirements).

2. **Create Payload config**
   - Add `payload.config.ts` with collections for employees, payroll runs, tax profiles, and pay statements.
   - Use `@payloadcms/db-postgres` adapter and connect to `DATABASE_URL`.

3. **Add a backend app entry**
   - Create a server entry (e.g. `src/server.ts`) to initialize Payload and its API routes.
   - Mount the Payload Admin UI at `/admin`.

4. **Extend `docker-compose.yml`**
   - Add a `payload` service that depends on `db` and `redis`.
   - Add a `redis` service using `redis:7-alpine`.
   - Expose ports and add environment variables for `DATABASE_URL` and `REDIS_URL`.

5. **Environment variables**
   - `DATABASE_URL=postgresql://postgres:postgres@db:5432/loadharbour_payroll`
   - `REDIS_URL=redis://redis:6379`
   - `PAYLOAD_SECRET=<generated secret>`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Data model outline
- **Employees**
  - Personal details, employment type, base pay, tax profile relation.
- **Payroll Runs**
  - Pay period, status, totals, run metadata.
- **Pay Statements**
  - Line items, deductions, net pay, linked to payroll run and employee.
- **Tax Profiles**
  - Filing status, allowances, jurisdiction metadata.

## Redis integration plan
- **Caching**
  - Use Redis to cache lookups of employee records and payroll configuration.
  - Set TTLs for computed values (e.g., payroll calendars).
- **Queueing**
  - Use a job queue (BullMQ or similar) for payroll run generation and PDF statement creation.
- **Rate limiting**
  - Use a Redis-backed limiter for admin APIs to prevent abuse.

## Security and operations
- Enforce Payload role-based access control for admin vs. employee roles.
- Rotate Payload secrets and database credentials per environment.
- Enable automated backups for Postgres and consider point-in-time recovery.
- Add observability (structured logs + metrics) for payroll runs and background jobs.

## Next steps checklist
- [ ] Add Payload dependencies and configuration.
- [ ] Create initial collections for payroll data.
- [ ] Add Redis service and integrate caching/queues.
- [ ] Wire up Docker services and validate local dev flow.
- [ ] Implement role-based access control and audit logging.
