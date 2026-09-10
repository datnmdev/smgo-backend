import { GetCurrentSubscriptionUsecase } from '@/modules/payment/domain/usecases/get-current-subscription.usecase';
import { Injectable } from '@nestjs/common';
import { SubscriptionPlanNotFoundException } from '../exceptions/subscription-plan-not-found.usecase';
import { BasicOrderLimitExceededException } from '../exceptions/basic-order-limit-exceeded.exception';
import { StandardOrderLimitExceededException } from '../exceptions/standard-order-limit-exceeded.exception';
import { PlusOrderLimitExceededException } from '../exceptions/plus-order-limit-exceeded.exception';
import { InvalidSubscriptionPlanException } from '../exceptions/invalid-subscription-plan.exception';
import { LocationSharingNotAllowedException } from '../exceptions/location-sharing-not-allowed.exception';
import {
  SubscriptionProductId,
  TSubscription,
} from '@/modules/payment/domain/entities/subscription.entity';

type PlanCapability = {
  maxOrders: number | null;
  canShareLocation: boolean;
};

@Injectable()
export class CheckPlanUsecase {
  private readonly planCapabilities: Record<
    SubscriptionProductId,
    PlanCapability
  > = {
    smgo_basic: {
      maxOrders: 10,
      canShareLocation: false,
    },

    smgo_standard: {
      maxOrders: 30,
      canShareLocation: false,
    },

    smgo_plus: {
      maxOrders: 50,
      canShareLocation: true,
    },

    smgo_premium: {
      maxOrders: null,
      canShareLocation: true,
    },
  };

  constructor(
    private readonly getCurrentPlanUsecase: GetCurrentSubscriptionUsecase,
  ) {}

  async execute(
    userId: string,
    options: {
      orderCount?: number;
      requiresLocationSharing?: boolean;
    },
  ): Promise<void> {
    const subscription = await this.getCurrentPlanUsecase.execute(userId);

    if (!subscription) {
      throw new SubscriptionPlanNotFoundException();
    }

    /*
     * Không được tin productId trực tiếp.
     *
     * Ví dụ:
     * premium + PAUSED  => không được dùng Premium
     * premium + ON_HOLD => không được dùng Premium
     * premium + CANCELED + chưa hết hạn => vẫn dùng Premium
     */
    const effectiveProductId = this.resolveEffectiveProductId(subscription);

    const capability = this.planCapabilities[effectiveProductId];

    if (!capability) {
      throw new InvalidSubscriptionPlanException(effectiveProductId);
    }

    this.checkOrderLimit(effectiveProductId, capability, options.orderCount);

    this.checkLocationSharing(
      effectiveProductId,
      capability,
      options.requiresLocationSharing,
    );
  }

  /**
   * Xác định gói THỰC SỰ có hiệu lực tại thời điểm hiện tại.
   */
  private resolveEffectiveProductId(
    subscription: TSubscription,
  ): SubscriptionProductId {
    const productId = subscription.productId;

    if (!this.isKnownProductId(productId)) {
      throw new InvalidSubscriptionPlanException(productId);
    }

    /*
     * Basic là gói mặc định.
     * EXPIRED / REVOKED đã được webhook chuyển về Basic,
     * nên không cần kiểm tra hai status đó ở đây.
     */
    if (productId === 'smgo_basic') {
      return 'smgo_basic';
    }

    /*
     * PAUSED:
     * tạm dừng subscription => không hưởng quyền trả phí.
     *
     * ON_HOLD:
     * vấn đề thanh toán => không hưởng quyền trả phí.
     */
    if (subscription.status === 'PAUSED' || subscription.status === 'ON_HOLD') {
      return 'smgo_basic';
    }

    /*
     * Gói trả phí bắt buộc phải có expiresAt.
     * Đây còn là lớp bảo vệ nếu dữ liệu DB bất thường.
     */
    if (!subscription.expiresAt) {
      return 'smgo_basic';
    }

    /*
     * Webhook EXPIRED có thể đến trễ.
     * Không cho phép dùng quyền trả phí chỉ dựa vào status.
     */
    if (subscription.expiresAt.getTime() <= Date.now()) {
      return 'smgo_basic';
    }

    /*
     * ACTIVE:
     * subscription hoạt động bình thường.
     */
    if (subscription.status === 'ACTIVE') {
      return productId;
    }

    /*
     * CANCELED:
     * chỉ tắt gia hạn.
     * Vẫn còn quyền đến expiresAt.
     */
    if (subscription.status === 'CANCELED') {
      return productId;
    }

    /*
     * Grace period:
     * vẫn giữ entitlement trong thời gian ân hạn.
     */
    if (subscription.status === 'IN_GRACE_PERIOD') {
      return productId;
    }

    /*
     * Status lạ => fail closed.
     */
    return 'smgo_basic';
  }

  private checkOrderLimit(
    productId: SubscriptionProductId,
    capability: PlanCapability,
    orderCount?: number,
  ): void {
    if (typeof orderCount !== 'number') {
      return;
    }

    /*
     * Không chấp nhận dữ liệu nghiệp vụ bất hợp lý.
     */
    if (!Number.isFinite(orderCount) || orderCount < 0) {
      return;
    }

    /*
     * null = unlimited.
     */
    if (capability.maxOrders === null) {
      return;
    }

    if (orderCount <= capability.maxOrders) {
      return;
    }

    switch (productId) {
      case 'smgo_basic':
        throw new BasicOrderLimitExceededException();

      case 'smgo_standard':
        throw new StandardOrderLimitExceededException();

      case 'smgo_plus':
        throw new PlusOrderLimitExceededException();

      /*
       * Premium unlimited nên về lý thuyết
       * không bao giờ vào đây.
       */
      case 'smgo_premium':
        return;

      default:
        throw new InvalidSubscriptionPlanException(productId);
    }
  }

  private checkLocationSharing(
    productId: SubscriptionProductId,
    capability: PlanCapability,
    requiresLocationSharing?: boolean,
  ): void {
    if (!requiresLocationSharing) {
      return;
    }

    if (capability.canShareLocation) {
      return;
    }

    throw new LocationSharingNotAllowedException(productId);
  }

  private isKnownProductId(
    productId: string,
  ): productId is SubscriptionProductId {
    return (
      productId === 'smgo_basic' ||
      productId === 'smgo_standard' ||
      productId === 'smgo_plus' ||
      productId === 'smgo_premium'
    );
  }
}
