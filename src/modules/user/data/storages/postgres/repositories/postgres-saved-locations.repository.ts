import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SavedLocationsRepository } from '@/modules/user/domain/repositories/saved-locations.repository';
import { SavedLocationModel } from '@/@types/modules/user/domain/models/saved-location';
import {
  FindSavedLocationsByQuery,
  SaveLocationData,
  UpdateSavedLocationData,
} from '@/@types/modules/user/domain/repositories/saved-locations.repository';
import { SavedLocations } from '../entities/saved-locations.entity';

@Injectable()
export class PostgresSavedLocationsRepository implements SavedLocationsRepository {
  constructor(
    @InjectRepository(SavedLocations)
    private readonly savedLocationsRepo: Repository<SavedLocations>,
  ) {}

  findByQuery(
    query?: FindSavedLocationsByQuery,
  ): Promise<SavedLocationModel[]> {
    return this.savedLocationsRepo
      .createQueryBuilder('savedLocations')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('savedLocations.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'savedLocations.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('savedLocations.contactPhone ILIKE :likeKeyword', {
                  likeKeyword: `%${query.keyword}%`,
                });
                qb.orWhere('savedLocations.contactName ILIKE :contactName', {
                  contactName: `%${query.keyword}%`,
                });
                qb.orWhere('savedLocations.name ILIKE :name', {
                  name: `%${query.keyword}%`,
                });
                qb.orWhere('savedLocations.address ILIKE :address', {
                  address: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.userId === 'string') {
            qb.andWhere('savedLocations.userId = :userId', {
              userId: query.userId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('savedLocations.id = :id', {
              id: query.id,
            });
          }
        }),
      )
      .getMany();
  }

  create(data: SaveLocationData): Promise<SavedLocationModel> {
    return this.savedLocationsRepo.save(this.savedLocationsRepo.create(data));
  }

  update(
    savedLocationId: string,
    data: UpdateSavedLocationData,
  ): Promise<SavedLocationModel> {
    return this.savedLocationsRepo.save(
      this.savedLocationsRepo.create({
        ...data,
        id: savedLocationId,
      }),
    );
  }
}
