import { Injectable } from '@nestjs/common';
import {
  UpdateProfileData,
  UserRepository,
} from '../repositories/user.repository';
import { AttachMediaUsecase } from '@/modules/storage/domain/usecases/attach-media.usecase';

@Injectable()
export class UpdateProfileUsecase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly attachMediaUsecase: AttachMediaUsecase,
  ) {}

  async execute(userId: string, data: UpdateProfileData): Promise<void> {
    await this.userRepo.update(userId, data);
    if (data?.avatar) {
      await this.attachMediaUsecase.execute([data.avatar]);
    }
  }
}
