import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { CustomError } from '@errors';
interface RequestContext {
    requestId: string;
    functionName: string;
    timestamp: string;
    userId?: string;
}
export interface LambdaRequest {
    event: APIGatewayProxyEvent;
    context: Context;
    requestContext: RequestContext;
}
export declare class ResponseHandler {
    static success(data: unknown, statusCode?: number): APIGatewayProxyResult;
    static error(error: Error | CustomError, requestId: string): APIGatewayProxyResult;
}
export declare function withErrorHandling(handler: (req: LambdaRequest) => Promise<APIGatewayProxyResult>, event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>;
export {};
//# sourceMappingURL=response.d.ts.map