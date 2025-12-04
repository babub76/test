import AWS from 'aws-sdk';
declare class DynamoDBConnection {
    get(params: any): Promise<any>;
    put(params: any): Promise<any>;
    update(params: any): Promise<any>;
    delete(params: any): Promise<any>;
    query(params: AWS.DynamoDB.DocumentClient.QueryInput): Promise<AWS.DynamoDB.DocumentClient.QueryOutput>;
    scan(params: AWS.DynamoDB.DocumentClient.ScanInput): Promise<AWS.DynamoDB.DocumentClient.ScanOutput>;
}
declare const _default: DynamoDBConnection;
export default _default;
//# sourceMappingURL=dynamodb.d.ts.map