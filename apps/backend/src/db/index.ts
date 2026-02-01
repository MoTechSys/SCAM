import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import logger from '../lib/logger.js';

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/s_acm';

// Determine if we need SSL (for Supabase/Railway)
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = connectionString.includes('supabase') || connectionString.includes('railway') || isProduction;

// Create postgres client with SSL support
const client = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  ssl: useSSL ? 'require' : false,
  prepare: false, // Required for Supabase transaction pooler
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Test connection
export const testConnection = async () => {
  try {
    await client`SELECT 1`;
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error}`);
    return false;
  }
};

// Close connection
export const closeConnection = async () => {
  await client.end();
  logger.info('Database connection closed');
};

export default db;
