import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL){throw new Error("Database url not found in .env")}

export default defineConfig({
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL
    }
})