import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://temper:temper@localhost:5432/temper',
  },
});
