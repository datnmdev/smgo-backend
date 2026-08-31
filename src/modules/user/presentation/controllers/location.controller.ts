import { Controller, Get, Query } from '@nestjs/common';
import { GetLocationSuggestionUsecase } from '../../domain/usecases/get-location-sugesstions.usecase';
import { AppResponse } from '@/core/common/response.dto';
import { GetLocationSuggestionsQueryRequestDto } from '../dtos/get-location-suggestions.dto';

@Controller('location')
export class LocationController {
  constructor(
    private readonly getLocationSuggestionUsecase: GetLocationSuggestionUsecase,
  ) {}

  @Get('/suggestions')
  async getLocationSuggestions(
    @Query() queryDto: GetLocationSuggestionsQueryRequestDto,
  ) {
    return AppResponse.ok(
      await this.getLocationSuggestionUsecase.execute({
        contactPhone: queryDto.contactPhone,
        address: queryDto.address,
        pageNumber: queryDto.pageNumber,
        pageSize: queryDto.pageSize,
      }),
    );
  }
}
