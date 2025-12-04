import { PoolClient } from 'pg';
declare class PostgresConnection {
    private pool;
    constructor();
    private initializePool;
    getConnection(): Promise<PoolClient>;
    query(text: string, params?: unknown[]): Promise<unknown>;
    close(): Promise<void>;
}
declare const _default: PostgresConnection;
export default _default;
//# sourceMappingURL=postgres.d.ts.map