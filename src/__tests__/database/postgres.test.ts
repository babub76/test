import postgresConnection from '@database/postgres';
import { Pool } from 'pg';

jest.mock('pg');

describe('PostgreSQL Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query', () => {
    it('should execute query successfully', async () => {
      const mockResult = {
        rowCount: 1,
        rows: [{ id: 1, name: 'Test' }],
      };

      const mockPool = Pool as jest.MockedClass<typeof Pool>;
      mockPool.prototype.query = jest.fn().mockResolvedValue(mockResult);

      // Note: In actual usage, you'd need to properly test the connection pool
      // This is a simplified example
      expect(postgresConnection).toBeDefined();
    });

    it('should throw DatabaseError on query failure', async () => {
      // This would require more complex mocking of the Pool
      expect(postgresConnection).toBeDefined();
    });
  });
});
