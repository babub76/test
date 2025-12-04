"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const _logger_1 = __importDefault(require("@logger"));
const _errors_1 = require("@errors");
class PostgresConnection {
    constructor() {
        this.pool = null;
        this.initializePool();
    }
    initializePool() {
        try {
            this.pool = new pg_1.Pool({
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
                _logger_1.default.error('Unexpected error on idle client', { error: err.message });
            });
            _logger_1.default.info('PostgreSQL connection pool initialized');
        }
        catch (error) {
            _logger_1.default.error('Failed to initialize PostgreSQL connection pool', { error: String(error) });
            throw error;
        }
    }
    async getConnection() {
        if (!this.pool) {
            throw new _errors_1.DatabaseError('Connection pool not initialized');
        }
        try {
            return await this.pool.connect();
        }
        catch (error) {
            _logger_1.default.error('Failed to get database connection', { error: String(error) });
            throw new _errors_1.DatabaseError('Failed to connect to database', { originalError: String(error) });
        }
    }
    async query(text, params) {
        if (!this.pool) {
            throw new _errors_1.DatabaseError('Connection pool not initialized');
        }
        try {
            const result = await this.pool.query(text, params);
            _logger_1.default.debug('Query executed successfully', { query: text, rowCount: result.rowCount });
            return result;
        }
        catch (error) {
            _logger_1.default.error('Database query failed', { query: text, error: String(error) });
            throw new _errors_1.DatabaseError('Database query failed', { originalError: String(error) });
        }
    }
    async close() {
        if (this.pool) {
            try {
                await this.pool.end();
                _logger_1.default.info('PostgreSQL connection pool closed');
            }
            catch (error) {
                _logger_1.default.error('Error closing connection pool', { error: String(error) });
            }
        }
    }
}
exports.default = new PostgresConnection();
//# sourceMappingURL=postgres.js.map