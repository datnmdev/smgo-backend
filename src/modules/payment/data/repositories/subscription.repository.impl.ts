import { Injectable } from '@nestjs/common';
import {
  AndroidTransaction,
  CreateSubscriptionData,
  FindSubscriptionsByQuery,
  Platform,
  SubscriptionPurchaseResult,
  SubscriptionRepository,
  UpdateSubscriptionData,
} from '../../domain/repositories/subscription.repository';
import { androidpublisher_v3, google } from 'googleapis';
import { ConfigService } from '@/core/config/config.service';
import path from 'path';
import { UnsupportedPlatformException } from '../exceptions/unsupported-platform.exception';
import { SubscriptionBasePlanIdMissingException } from '../exceptions/subscription-base-plan-id-missing.exception';
import { SubscriptionBasePlanNotFoundException } from '../exceptions/subscription-base-plan-not-found.exception';
import { SubscriptionBasePlanPriceMissingException } from '../exceptions/subscription-base-plan-price-missing.exception';
import { SubscriptionBasePlanCurrencyCodeMissingException } from '../exceptions/subscription-base-plan-currency-code-missing.exception';
import { Brackets, Repository } from 'typeorm';
import { SubscriptionModel } from '../models/subscription.model';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscriptionProductId,
  TSubscription,
} from '../../domain/entities/subscription.entity';

@Injectable()
export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  private androidPublisher: androidpublisher_v3.Androidpublisher;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SubscriptionModel)
    private readonly subscriptionRepo: Repository<SubscriptionModel>,
  ) {
    // Khởi tạo Google Auth
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(
        process.cwd(),
        configService.googleServiceAccountConfig().googleServiceAccountFilePath,
      ),
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    this.androidPublisher = google.androidpublisher({
      version: 'v3',
      auth,
    });
  }

  private async getGoogleSubscriptionInfo(
    packageName: string,
    purchaseToken: string,
  ): Promise<androidpublisher_v3.Schema$SubscriptionPurchaseV2> {
    const response = await this.androidPublisher.purchases.subscriptionsv2.get({
      packageName,
      token: purchaseToken,
    });

    return response.data;
  }

  async getSubscriptionPurchase(
    platform: Platform,
    purchaseToken: string,
  ): Promise<SubscriptionPurchaseResult<AndroidTransaction>> {
    if (platform === 'android') {
      return this.getAndroidSubscriptionPurchase(purchaseToken);
    }

    throw new UnsupportedPlatformException();
  }

  private async getAndroidSubscriptionPurchase(
    purchaseToken: string,
  ): Promise<SubscriptionPurchaseResult<AndroidTransaction>> {
    const { packageName } = this.configService.googleSubscriptionConfig();

    const purchase = await this.getGoogleSubscriptionInfo(
      packageName,
      purchaseToken,
    );

    const lineItem = purchase.lineItems?.[0] ?? null;

    const productId =
      (lineItem?.productId as SubscriptionProductId | undefined) ?? null;

    const orderId = lineItem?.latestSuccessfulOrderId ?? null;

    const expiryTime = lineItem?.expiryTime ?? null;

    const startsAt = purchase.startTime ? new Date(purchase.startTime) : null;

    const expiresAt = expiryTime ? new Date(expiryTime) : null;

    const isAutoRenew = lineItem?.autoRenewingPlan?.autoRenewEnabled ?? null;

    /*
     * Account identifier mà Flutter đã gửi vào
     * PurchaseParam.applicationUserName.
     *
     * Backend sẽ dùng giá trị này để xác minh
     * purchase thuộc đúng user SmGo.
     */
    const externalAccountId =
      purchase.externalAccountIdentifiers?.obfuscatedExternalAccountId ?? null;
    const outOfAppPurchaseContext = purchase.outOfAppPurchaseContext
      ? {
          expiredPurchaseToken:
            purchase.outOfAppPurchaseContext.expiredPurchaseToken ?? null,

          expiredExternalAccountId:
            purchase.outOfAppPurchaseContext.expiredExternalAccountIdentifiers
              ?.obfuscatedExternalAccountId ?? null,
        }
      : null;

    let priceCurrency: string | null = null;
    let amount: number | null = null;

    const basePlanId = lineItem?.offerDetails?.basePlanId ?? null;

    /*
     * Price chỉ là metadata bổ sung.
     * Không được làm purchase extraction fail.
     */
    if (productId && basePlanId) {
      try {
        const price = await this.getAndroidProductPrice({
          productId,
          basePlanId,
        });

        priceCurrency = price.currency;
        amount = price.amount;
      } catch {
        // intentionally ignore
      }
    }

    return {
      transaction: {
        orderId,
        productId,
        purchaseToken,
        priceCurrency,
        amount,
        rawPayload: purchase,
      },
      subscription: {
        platform: 'android',
        productId,
        purchaseToken,
        startsAt,
        expiresAt,
        isAutoRenew,
        state: purchase.subscriptionState ?? null,
        externalAccountId,
        outOfAppPurchaseContext,
      },
    };
  }

  async acknowledgeAndroidPurchase(
    purchaseToken: string,
    productId: string,
  ): Promise<void> {
    const { packageName } = this.configService.googleSubscriptionConfig();

    const data = await this.getGoogleSubscriptionInfo(
      packageName,
      purchaseToken,
    );

    if (data.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED') {
      return;
    }

    await this.androidPublisher.purchases.subscriptions.acknowledge({
      packageName,
      token: purchaseToken,
      subscriptionId: productId,
      requestBody: {},
    });
  }

  async createSubscription(
    data: CreateSubscriptionData,
    manager?: any,
  ): Promise<TSubscription> {
    const repo: Repository<SubscriptionModel> = !manager
      ? this.subscriptionRepo
      : manager.manager.getRepository(SubscriptionModel);
    return repo.save(repo.create(data));
  }

  async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionData,
    manager?: any,
  ): Promise<void> {
    const repo: Repository<SubscriptionModel> = !manager
      ? this.subscriptionRepo
      : manager.manager.getRepository(SubscriptionModel);
    await repo.save(
      repo.create({
        ...data,
        id: subscriptionId,
      }),
    );
  }

  private async getAndroidProductPrice({
    productId,
    basePlanId,
  }: {
    productId: string;
    basePlanId: string | null;
  }) {
    const { packageName } = this.configService.googleSubscriptionConfig();

    if (!basePlanId) {
      throw new SubscriptionBasePlanIdMissingException(productId);
    }
    const { data: subscription } =
      await this.androidPublisher.monetization.subscriptions.get({
        packageName,
        productId,
      });
    const basePlan = subscription.basePlans?.find(
      (bp) => bp.basePlanId === basePlanId,
    );
    if (!basePlan) {
      throw new SubscriptionBasePlanNotFoundException(productId, basePlanId);
    }
    const regionalConfig = basePlan.regionalConfigs?.[0];
    const price = regionalConfig?.price;
    if (!price) {
      throw new SubscriptionBasePlanPriceMissingException(
        productId,
        basePlanId,
      );
    }
    if (!price.currencyCode) {
      throw new SubscriptionBasePlanCurrencyCodeMissingException(
        productId,
        basePlanId,
      );
    }
    const units = price.units ?? '0';
    const nanos = price.nanos ?? 0;
    return {
      currency: price.currencyCode,
      amount: Number(units) + nanos / 1_000_000_000,
    };
  }

  getSubscriptions(query?: FindSubscriptionsByQuery): Promise<TSubscription[]> {
    return this.subscriptionRepo
      .createQueryBuilder('subscription')
      .where(
        new Brackets((qb) => {
          if (typeof query?.userId === 'string') {
            qb.andWhere('subscription.userId = :userId', {
              userId: query.userId,
            });
          }

          if (typeof query?.purchaseToken === 'string') {
            qb.andWhere('subscription.purchaseToken = :purchaseToken', {
              purchaseToken: query.purchaseToken,
            });
          }
        }),
      )
      .getMany();
  }
}
