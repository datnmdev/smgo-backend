import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GetLocationSuggestionUsecase } from '../../domain/usecases/get-location-sugesstions.usecase';
import { AppResponse } from '@/core/common/response.dto';
import { GetLocationSuggestionsQueryRequestDto } from '../dtos/get-location-suggestions.dto';
import { JwtAuthGuard } from '@/core/security/jwt-auth.guard';
import { GetShareLocationUrlUsecase } from '../../domain/usecases/get-share-location-url.usecase';
import { CheckShareLocationTokenUsecase } from '../../domain/usecases/check-share-location-token.usecase';
import { LoadShareLocationPageQueryReqDto } from '../dtos/load-share-location-page.dto';
import {
  ShareLocationBodyReqDto,
  ShareLocationQueryReqDto,
} from '../dtos/share-location.dto';
import { SaveShareLocationUsecase } from '../../domain/usecases/save-share-location.usecase';
import { GetShareLocationUsecase } from '../../domain/usecases/get-share-location.usecase';
import { GetShareLocationQueryReqDto } from '../dtos/get-share-location.dto';
import ejs from 'ejs';
import path from 'path';
import { GetShareLocationUrlQueryReqDto } from '../dtos/get-share-location-url.dto';
import { AuthPayload } from '@/core/decorators/auth-payload.decorator';
import { JwtPayload } from '@/core/security/jwt.strategy';
import { GetDeliveryRoutesUsecase } from '@/modules/delivery-route/domain/usecases/get-delivery-routes.usecase';
import { DeliveryRouteNotFoundException } from '@/modules/delivery-route/domain/exceptions/delivery-route-not-found.exception';
import { DeliveryOrderNotFoundException } from '@/modules/delivery-route/domain/exceptions/delivery-order-not-found.exception';
import { GetDeliveryOrdersUsecase } from '@/modules/delivery-route/domain/usecases/get-delivery-orders.usecase';
import { ConfigService } from '@/core/config/config.service';
import { Request, Response } from 'express';

@Controller('location')
export class LocationController {
  constructor(
    private readonly getLocationSuggestionUsecase: GetLocationSuggestionUsecase,
    private readonly getShareLocationUrlUsecase: GetShareLocationUrlUsecase,
    private readonly checkShareLocationTokenUsecase: CheckShareLocationTokenUsecase,
    private readonly saveShareLocationUsecase: SaveShareLocationUsecase,
    private readonly getShareLocationUsecase: GetShareLocationUsecase,
    private readonly getDeliveryRouteUsecase: GetDeliveryRoutesUsecase,
    private readonly getDeliveryOrdersUsecase: GetDeliveryOrdersUsecase,
    private readonly configService: ConfigService,
  ) {}

  @Get('suggestions')
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

  @UseGuards(JwtAuthGuard)
  @Get('share-url')
  async getShareLocationUrl(
    @AuthPayload() authPayload: JwtPayload,
    @Query() getShareLocationUrlQuery: GetShareLocationUrlQueryReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.getShareLocationUrlUsecase.execute(
        authPayload.userId,
        getShareLocationUrlQuery.deliveryRouteId,
        getShareLocationUrlQuery.deliveryOrderId,
      ),
    );
  }

  @Get('share/load-page')
  async loadShareLocationPage(
    @Query() loadShareLocationQuery: LoadShareLocationPageQueryReqDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const baseUrl = this.configService.getServerConfig().serverBaseUrl;
    try {
      const payload = await this.checkShareLocationTokenUsecase.execute(
        loadShareLocationQuery.tokenKey,
      );
      const deliveryRoute = (
        await this.getDeliveryRouteUsecase.execute({
          userId: payload.userId,
          id: payload.deliveryRouteId,
        })
      ).data?.[0];
      if (!deliveryRoute) {
        throw new DeliveryRouteNotFoundException();
      }
      const deliveryOrder = (
        await this.getDeliveryOrdersUsecase.execute({
          deliveryRouteId: payload.deliveryRouteId,
          id: payload.deliveryOrderId,
        })
      )?.[0];
      if (!deliveryOrder) {
        throw new DeliveryOrderNotFoundException();
      }
      const shareLocationEjsPath = path.join(
        process.cwd(),
        'resources',
        'ejs',
        'share-location.ejs',
      );
      const queryParams = new URLSearchParams({
        tokenKey: loadShareLocationQuery.tokenKey,
      });
      const html = await ejs.renderFile(shareLocationEjsPath, {
        orderMediaUrl:
          deliveryOrder.orderMediaUrl ??
          `${baseUrl}/public/images/default-order.png`,
        orderCode: deliveryOrder.orderCode,
        orderName: deliveryOrder.orderName,
        contactName: deliveryOrder.contactName,
        contactPhone: deliveryOrder.contactPhone,
        address: deliveryOrder.address,
        logoUrl: `${baseUrl}/public/images/logo-text.png`,
        splashUrl: `${baseUrl}/public/images/bg-splash.png`,
        googleMapsIconUrl: `${baseUrl}/public/icons/google-maps.png`,
        smGoMapsIconUrl: `${baseUrl}/public/icons/smgo-logo.png`,
        getSharedLocationUrl: `${baseUrl}/api/location/share?${queryParams.toString()}`,
        saveShareLocationUrl: `${baseUrl}/api/location/share?${queryParams.toString()}`,
        shareLocationPreviewUrl: `${baseUrl}/public/images/share-location-preview.png`,
        shareLocationUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      });
      return res.setHeader('Content-Type', 'text/html').send(html);
    } catch {
      const shareLocationFinishedEjsPath = path.join(
        process.cwd(),
        'resources',
        'ejs',
        'share-location-finished.ejs',
      );
      const html = await ejs.renderFile(shareLocationFinishedEjsPath, {
        logoUrl: `${baseUrl}/public/images/logo-text.png`,
        splashImgUrl: `${baseUrl}/public/images/bg-splash.png`,
        shareLocationPreviewUrl: `${baseUrl}/public/images/share-location-preview.png`,
        shareLocationUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      });
      return res.setHeader('Content-Type', 'text/html').send(html);
    }
  }

  @Get('share')
  async getShareLocation(
    @Query() getShareLocationQuery: GetShareLocationQueryReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.getShareLocationUsecase.execute(getShareLocationQuery.tokenKey),
    );
  }

  @Post('share')
  async shareLocation(
    @Query() shareLocationQuery: ShareLocationQueryReqDto,
    @Body() shareLocationBody: ShareLocationBodyReqDto,
  ): Promise<AppResponse> {
    return AppResponse.ok(
      await this.saveShareLocationUsecase.execute(
        shareLocationQuery.tokenKey,
        shareLocationBody,
      ),
    );
  }
}
