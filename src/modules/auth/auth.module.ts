import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './presentation/controllers/auth.controller';
import { SignInWithGoogleUsecase } from './domain/usecases/sign-in-with-google.usecase';
import { SignInWithFacebookUsecase } from './domain/usecases/sign-in-with-facebook.usecase';
import { UnitOfWorkModule } from '@/core/unit-of-work/unit-of-work.module';
import { ConfigModule } from '@/core/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { SignOutUsecase } from './domain/usecases/sign-out.usecase';
import { TokenBlacklistRepository } from './domain/repositories/token-blacklist.repository';
import { RedisTokenBlacklistRepository } from './data/storages/redis/repositories/token-blacklist.repository';
import { TokenProvider } from './domain/services/token-provider.service';
import { TokenProviderImpl } from './data/services/token-provider';
import { SessionRepository } from './domain/repositories/session.repository';
import { RedisSessionRepository } from './data/storages/redis/repositories/session.repository';
import { RefreshTokenUsecase } from './domain/usecases/refresh-token.usecase';
import { IsBlacklistedUsecase } from './domain/usecases/is-blacklisted.usecase';
import { JwtStrategy } from './security/jwt.strategy';

@Module({
  imports: [UserModule, UnitOfWorkModule, ConfigModule, JwtModule],
  controllers: [AuthController],
  providers: [
    // Auth strategy
    JwtStrategy,

    // Repositories
    {
      provide: TokenBlacklistRepository,
      useClass: RedisTokenBlacklistRepository,
    },
    {
      provide: TokenProvider,
      useClass: TokenProviderImpl,
    },
    {
      provide: SessionRepository,
      useClass: RedisSessionRepository,
    },

    // Usecases
    SignInWithGoogleUsecase,
    SignInWithFacebookUsecase,
    SignOutUsecase,
    RefreshTokenUsecase,
    IsBlacklistedUsecase,
  ],
})
export class AuthModule {}
