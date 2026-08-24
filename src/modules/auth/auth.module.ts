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
import { TokenProvider } from './domain/services/token-provider.service';
import { TokenProviderImpl } from './data/services/token-provider';
import { SessionRepository } from './domain/repositories/session.repository';
import { RefreshTokenUsecase } from './domain/usecases/refresh-token.usecase';
import { IsBlacklistedUsecase } from './domain/usecases/is-blacklisted.usecase';
import { JwtStrategy } from '../../core/security/jwt.strategy';
import { TokenBlacklistRepositoryImpl } from './data/repositories/token-blacklist.repository.impl';
import { SessionRepositoryImpl } from './data/repositories/session.repository.impl';

@Module({
  imports: [UserModule, UnitOfWorkModule, ConfigModule, JwtModule],
  controllers: [AuthController],
  providers: [
    // Auth strategy
    JwtStrategy,

    // Repositories
    {
      provide: TokenBlacklistRepository,
      useClass: TokenBlacklistRepositoryImpl,
    },
    {
      provide: TokenProvider,
      useClass: TokenProviderImpl,
    },
    {
      provide: SessionRepository,
      useClass: SessionRepositoryImpl,
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
