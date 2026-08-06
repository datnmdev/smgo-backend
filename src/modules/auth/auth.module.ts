import { Module } from '@nestjs/common';
import { RedisTokenRepository } from './data/storages/redis/repositories/redis-token.repository';
import { AddTokenToBlacklistUsecase } from './domain/usecases/add-token-to-blacklist.usecase';
import { IsBlacklistedUsecase } from './domain/usecases/is-blacklisted.usecase';
import { getRepositoryToken } from '@/core/decorators/inject-repository.decorator';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule
  ],
  controllers: [],
  providers: [
    {
      provide: getRepositoryToken(RedisTokenRepository),
      useClass: RedisTokenRepository,
    },
    AddTokenToBlacklistUsecase,
    IsBlacklistedUsecase,
  ],
})
export class AuthModule {}
