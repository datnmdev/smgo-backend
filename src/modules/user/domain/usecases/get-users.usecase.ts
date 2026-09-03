import { Injectable } from '@nestjs/common';
import {
  FindUsersByQuery,
  UserRepository,
} from '../repositories/user.repository';
import { TUser } from '../entities/user.entity';
import { GetPresignedDownloadUrlUsecase } from '@/modules/storage/domain/usecases/get-presigned-download-url.usecase';

@Injectable()
export class GetUsersUsecase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly getPresignedDownloadUrlUsecase: GetPresignedDownloadUrlUsecase,
  ) {}

  async execute(query: FindUsersByQuery): Promise<TUsers> {
    let users = (await this.userRepo.findByQuery(query)) as TUsers;
    users = await Promise.all(
      users.map(async (user) => ({
        ...user,
        avatarUrl:
          user.avatar != null
            ? (user.avatar.startsWith('https://')
              ? user.avatar
              : await this.getPresignedDownloadUrlUsecase.execute(user.avatar))
            : null,
      })),
    );
    return users;
  }
}

type TUsers = Array<TUser & { avatarUrl?: string | null }>;
