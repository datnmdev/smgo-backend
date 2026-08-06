import { Injectable } from '@nestjs/common';
import {
  RedisTokenRepository,
  TokenRepository,
} from '../repositories/token.repository';
import { InjectRepository } from '@/core/decorators/inject-repository.decorator';

@Injectable()
export class IsBlacklistedUsecase {
  constructor(
    @InjectRepository(RedisTokenRepository)
    private readonly tokenRepo: TokenRepository,
  ) {}

  execute(jti: string): Promise<boolean> {
    return this.tokenRepo.isBlacklisted(jti);
  }
}
