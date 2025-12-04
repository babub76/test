import { ResponseHandler } from '@utils/response';
import { ValidationError } from '@errors';

describe('ResponseHandler', () => {
  describe('success', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = ResponseHandler.success(data, 200);

      expect(response.statusCode).toBe(200);
      expect(response.headers!['Content-Type']).toBe('application/json');

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.timestamp).toBeDefined();
    });

    it('should return success response with default status code 200', () => {
      const response = ResponseHandler.success({ result: 'ok' });

      expect(response.statusCode).toBe(200);
    });

    it('should return success response with custom status code', () => {
      const response = ResponseHandler.success({ id: 1 }, 201);

      expect(response.statusCode).toBe(201);
    });
  });

  describe('error', () => {
    it('should return error response for custom error', () => {
      const error = new ValidationError('Invalid input', { field: 'required' });
      const response = ResponseHandler.error(error, 'req-123');

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('Invalid input');
      expect(body.error.requestId).toBe('req-123');
      expect(body.error.details).toEqual({ field: 'required' });
    });

    it('should return error response for generic error', () => {
      const error = new Error('Something went wrong');
      const response = ResponseHandler.error(error, 'req-456');

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(body.error.message).toBe('Something went wrong');
      expect(body.error.requestId).toBe('req-456');
    });

    it('should include CORS headers in error response', () => {
      const error = new Error('Test error');
      const response = ResponseHandler.error(error, 'req-123');

      expect(response.headers!['Access-Control-Allow-Origin']).toBe('*');
    });
  });
});
