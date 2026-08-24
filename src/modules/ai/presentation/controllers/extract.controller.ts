import { AppResponse } from '@/core/common/response.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ExtractOrderInfoQueryDto } from '../dtos/extract-order-info.dto';
import { ExtractOrderInfoUsecase } from '../../domain/usecases/extract-order-info.usecase';

@Controller('ai/extract')
export class ExtractController {
  constructor(
    private readonly extractOrderInfoUsecase: ExtractOrderInfoUsecase,
  ) {}

  @Get('/order-info')
  async getOrderInfoFromOcr(@Query() queryDto: ExtractOrderInfoQueryDto) {
    return AppResponse.ok(
      await this.extractOrderInfoUsecase.execute(queryDto.ocrText)
    );
  }
}
