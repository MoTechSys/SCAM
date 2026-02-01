import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import logger from '../lib/logger.js';

// Database connection string - prioritize SCAM_DATABASE_URL to avoid conflicts with Manus env
const connectionString = process.env.SCAM_DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/s_acm';

// Log connection info (without password)
const sanitizedUrl = connectionString.replace(/:[^:@]+@/, ':***@');
logger.info(`📦 Database URL: ${sanitizedUrl}`);

// Determine if we need SSL
// Force SSL for any external connection (not localhost)
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = !isLocalhost || isProduction;

logger.info(`🔐 SSL Mode: ${useSSL ? 'enabled' : 'disabled'}`);

// Create postgres client with proper SSL and pooler settings
const client = postgres(connectionString, {
  max: 10, // Maximum connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 30, // Connection timeout (increased for remote connections)
  ssl: useSSL ? { rejectUnauthorized: false } : false, // SSL with self-signed cert support
  prepare: false, // Required for Supabase transaction pooler (port 6543)
  onnotice: () => {}, // Suppress notice messages
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Test connection
export const testConnection = async () => {
  try {
    const result = await client`SELECT 1 as test`;
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
