import { Injectable } from '@nestjs/common';
import {
  RedisTokenRepository,
  TokenRepository,
} from '../repositories/token.repository';
import jwt from 'jsonwebtoken';
import dfns from 'date-fns';
import { JwtPayload } from '@/@types/jwt';
import { InjectRepository } from '@/core/decorators/inject-repository.decorator';

@Injectable()
export class AddTokenToBlacklistUsecase {
  constructor(
    @InjectRepository(RedisTokenRepository)
    private readonly tokenRepo: TokenRepository,
  ) {}

  async execute(token: string): Promise<void> {
    const tokenPayload = jwt.decode(token) as JwtPayload;
    await this.tokenRepo.addToBlacklist(
      token,
      dfns.differenceInSeconds(tokenPayload.exp * 1000, Date.now()),
    );
  }
}
