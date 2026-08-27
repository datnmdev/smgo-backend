import { Injectable } from '@nestjs/common';
import { CreateMediaData, FindMediaByQuery, MediaRepository } from '../../domain/repositories/media.repository';
import { Brackets, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaModel } from '../models/media.model';

@Injectable()
export class MediaRepositoryImpl implements MediaRepository {
  constructor(
    @InjectRepository(MediaModel)
    private readonly mediaRepo: Repository<MediaModel>,
  ) {}

  findByQuery(query?: FindMediaByQuery): Promise<MediaModel[]> {
    return this.mediaRepo
      .createQueryBuilder('media')
      .where(
        new Brackets((qb) => {
          if (Array.isArray(query?.ids)) {
            if (query.ids.length > 0) {
              qb.andWhere('media.id IN (:...ids)', {
                ids: query.ids,
              });
            } else {
              qb.andWhere('media.id IS NULL');
            }
          }
        }),
      )
      .getMany();
  }

  create(data: CreateMediaData): Promise<MediaModel> {
    return this.mediaRepo.save(
      this.mediaRepo.create({
        fileKey: data.fileKey,
      }),
    );
  }

  async attachMedia(mediaIds: string[]): Promise<void> {
    if (mediaIds.length === 0) return;
    await this.mediaRepo.update(
      {
        id: In(mediaIds),
      },
      {
        status: 'attached',
      },
    );
  }
}
