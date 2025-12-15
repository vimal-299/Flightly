import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import {schema} from './schema'

if (!process.env.DATABASE_URL){throw new Error("Database url not found in .env")}

const client = postgres(process.env.DATABASE_URL)

export const db = drizzle(client, { schema })