// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Configure connection string with pgBouncer pooling settings for Supabase
const getConnectionString = () => {
  const url = env.DATABASE_URL;
  
  // Check if we're using Supabase pooler (contains 'pooler.supabase.com')
  if (url.includes('pooler.supabase.com')) {
    // Already using connection pooler, add connection parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}pgbouncer=true&connection_limit=1&pool_timeout=10`;
  }
  
  // For direct connections, add connection pool settings
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=1&pool_timeout=10`;
};

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: getConnectionString(),
      },
    },
  });

if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
