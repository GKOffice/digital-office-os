import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool;

export const db = {
  async connect() {
    const isNeon = process.env.DATABASE_URL?.includes('neon.tech');
    
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: isNeon ? { rejectUnauthorized: false } : false
    });
    
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    
    return pool;
  },
  
  async query(text, params) {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug({ 
      query: text.substring(0, 100), 
      duration, 
      rows: result.rowCount 
    }, 'Query executed');
    
    return result;
  },
  
  async getClient() {
    return pool.connect();
  }
};
