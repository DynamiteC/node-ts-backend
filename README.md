# Modern Node.js v22 Fastify Boilerplate

A production-ready boilerplate using Fastify, TypeScript (Strict ESM), and Zod.

## Features
- **Fastify v5**: Latest framework version.
- **TypeScript**: Strict mode, ESM.
- **Plugins**: Modular architecture via `@fastify/autoload`.
- **Validation**: Zod + `fastify-type-provider-zod`.
- **Databases**: PostgreSQL, MySQL, MongoDB, Redis (Raw drivers).
- **Testing**: Tap.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start Databases (Optional):
   ```bash
   docker-compose up -d
   ```

3. Configure Environment:
   Create a `.env` file (optional, defaults provided):
   ```env
   NODE_ENV=development
   PORT=3000
   # Uncomment to enable DBs
   # POSTGRES_URL=postgres://user:password@localhost:5432/db
   # MYSQL_URL=mysql://user:password@localhost:3306/db
   # MONGO_URL=mongodb://localhost:27017/db
   # REDIS_URL=redis://localhost:6379
   ```

4. Run Dev Server:
   ```bash
   pnpm dev
   ```

5. Test:
   ```bash
   pnpm test
   ```

## Structure
- `src/app.ts`: App factory.
- `src/server.ts`: Entry point.
- `src/plugins/`: Global plugins (DBs, Config).
- `src/routes/`: Route modules.
- `src/services/`: Business logic / Raw DB queries.
