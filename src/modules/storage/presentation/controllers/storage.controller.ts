import { Controller, Get } from '@nestjs/common';
import { AppResponse } from '@/core/common/response.dto';
import { GetPresignedUploadUrlUsecase } from '../../domain/usecases/get-presigned-upload-url.usecase';
import { TUploadUrl } from '../../domain/entities/upload-url.entity';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly getPresignedUploadUrlUsecase: GetPresignedUploadUrlUsecase,
  ) {}

  @Get('file/upload')
  async getPresignedUploadUrl(): Promise<AppResponse<TUploadUrl>> {
    return AppResponse.ok(await this.getPresignedUploadUrlUsecase.execute());
  }
}
