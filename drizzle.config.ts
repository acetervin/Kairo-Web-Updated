import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL or DB_URL must be set, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
    ssl: { rejectUnauthorized: false } as any,
  },
});
