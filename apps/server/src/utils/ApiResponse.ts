import type { StatusCode } from './statusCodes.js';

export class ApiResponse<TData = null> {
  public readonly statusCode: StatusCode;
  public readonly data: TData;
  public readonly message: string;
  public readonly success: boolean;
  public readonly timestamp: string;

  constructor(statusCode: StatusCode, data: TData, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}
