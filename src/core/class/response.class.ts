import { HttpStatus } from "@nestjs/common";

export class AppResponse<T = any, E = any> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  error: E;

  static ok(data: any) {
    const res = new AppResponse();
    res.statusCode = HttpStatus.OK;
    res.isSuccess = true;
    res.data = data;
    res.error = null;
    return res;
  }

  static error(statusCode: number, error: any) {
    const res = new AppResponse();
    res.statusCode = statusCode;
    res.isSuccess = false;
    res.data = null;
    res.error = error;
    return res;
  }
}