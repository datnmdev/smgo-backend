import { HttpStatus } from '@nestjs/common';

export interface AppResponse<T = any, E = any> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  error: E;
}
