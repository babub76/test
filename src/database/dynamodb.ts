import AWS from 'aws-sdk';
import logger from '@logger';
import { DatabaseError } from '@errors';

const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

class DynamoDBConnection {
  async get(params: any): Promise<any> {
    try {
      logger.debug('DynamoDB get operation', { table: params.TableName, key: params.Key });
      const result = await dynamodb.get(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB get operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB get operation failed', { originalError: String(error) });
    }
  }

  async put(params: any): Promise<any> {
    try {
      logger.debug('DynamoDB put operation', { table: params.TableName });
      const result = await dynamodb.put(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB put operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB put operation failed', { originalError: String(error) });
    }
  }

  async update(params: any): Promise<any> {
    try {
      logger.debug('DynamoDB update operation', { table: params.TableName });
      const result = await dynamodb.update(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB update operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB update operation failed', { originalError: String(error) });
    }
  }

  async delete(params: any): Promise<any> {
    try {
      logger.debug('DynamoDB delete operation', { table: params.TableName });
      const result = await dynamodb.delete(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB delete operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB delete operation failed', { originalError: String(error) });
    }
  }

  async query(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> {
    try {
      logger.debug('DynamoDB query operation', { table: params.TableName });
      const result = await dynamodb.query(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB query operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB query operation failed', { originalError: String(error) });
    }
  }

  async scan(params: AWS.DynamoDB.DocumentClient.ScanInput): Promise<AWS.DynamoDB.DocumentClient.ScanOutput> {
    try {
      logger.debug('DynamoDB scan operation', { table: params.TableName });
      const result = await dynamodb.scan(params).promise();
      return result;
    } catch (error) {
      logger.error('DynamoDB scan operation failed', { error: String(error), table: params.TableName });
      throw new DatabaseError('DynamoDB scan operation failed', { originalError: String(error) });
    }
  }
}

export default new DynamoDBConnection();
