import { Controller, Get } from '@nestjs/common';
import { v4 } from 'uuid';
import { AppResponse } from '@/core/common/response.dto';
import { GetPresignedUploadUrlUsecase } from '../../domain/usecases/get-presigned-upload-url.usecase';
import { TUploadUrl } from '../../domain/entities/upload-url.entity';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly getPresignedUploadUrl: GetPresignedUploadUrlUsecase,
  ) {}

  @Get('file/upload')
  async getUploadUrl(): Promise<AppResponse<TUploadUrl>> {
    return AppResponse.ok(
      await this.getPresignedUploadUrl.execute({
        fileKey: v4(),
        expiry: 15 * 60,
      }),
    );
  }
}
