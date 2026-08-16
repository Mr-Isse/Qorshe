# QORSHE database foundation

QORSHE uses **PostgreSQL hosted on Supabase** and **Prisma ORM**. Database credentials must remain local and must never be committed.

## Configure Supabase

Copy the environment template into a local `backend/.env` file and set the Supabase connection strings supplied by the project owner:

```env
DATABASE_URL=<Supabase pooled connection string>
DIRECT_URL=<Supabase direct connection string>
```

`DATABASE_URL` is used for runtime Prisma connections. `DIRECT_URL` is reserved for direct administrative and migration connections when required by the deployment workflow.

## Prisma commands

Run commands from `backend/`:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate -- --name <migration-name>
npm run db:seed
```

The seed creates only the global default categories and is idempotent. It does not create users, transactions, budgets, savings records, goals, or notifications.

Use `npx prisma studio` only on a private development machine. Never expose Prisma Studio publicly.

## Production migration warning

Do not run destructive reset commands against Supabase. Before applying migrations to a database that may contain important data, inspect the target database and review the generated SQL. Use a controlled deployment process and preserve the migration history.
