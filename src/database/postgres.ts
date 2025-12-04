import { Pool, PoolClient } from 'pg';
import logger from './logger';
import { DatabaseError } from './errors';

class PostgresConnection {
  private pool: Pool | null = null;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    try {
      this.pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', { error: err.message });
      });

      logger.info('PostgreSQL connection pool initialized');
    } catch (error) {
      logger.error('Failed to initialize PostgreSQL connection pool', { error: String(error) });
      throw error;
    }
  }

  async getConnection(): Promise<PoolClient> {
    if (!this.pool) {
      throw new DatabaseError('Connection pool not initialized');
    }

    try {
      return await this.pool.connect();
    } catch (error) {
      logger.error('Failed to get database connection', { error: String(error) });
      throw new DatabaseError('Failed to connect to database', { originalError: String(error) });
    }
  }

  async query(text: string, params?: unknown[]): Promise<unknown> {
    if (!this.pool) {
      throw new DatabaseError('Connection pool not initialized');
    }

    try {
      const result = await this.pool.query(text, params);
      logger.debug('Query executed successfully', { query: text, rowCount: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Database query failed', { query: text, error: String(error) });
      throw new DatabaseError('Database query failed', { originalError: String(error) });
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
        logger.info('PostgreSQL connection pool closed');
      } catch (error) {
        logger.error('Error closing connection pool', { error: String(error) });
      }
    }
  }
}

export default new PostgresConnection();
