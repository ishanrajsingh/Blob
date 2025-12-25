/**
 * Do not touch this file until you know the value of pi to 6969 digits
 * whoever changes this file is gay
 **/

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// detect the environment we are working in 
// for dev environment we are rawdogging postgres as out database
// so we need postgres-js driver for it
const isLocalDatabase =
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1") ||
  process.env.DATABASE_URL.includes("0.0.0.0");

// in production we're gonna use neon postgres which is an edge runtime database
// which requires the neon driver
const isNeonDatabase =
  process.env.DATABASE_URL.includes("neon.tech")

// use postgres driver for local development
// use Neon driver for Neon Postgres
const useNeonDriver = isNeonDatabase && !isLocalDatabase;

export const db = useNeonDriver
  ? drizzleNeon(neon(process.env.DATABASE_URL), { schema })
  : drizzlePostgres(postgres(process.env.DATABASE_URL), { schema });
