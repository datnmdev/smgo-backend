import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LocationModel } from '../models/location.model';
import {
  CreateLocationData,
  FindLocationsByPhoneAndAddress,
  FindLocationsByQuery,
  LocationRepository,
  UpdateLocationData,
} from '../../domain/repositories/location.repository';
import { TPaginationResponse } from '@/core/common/pagination.entity';
import { TLocation } from '../../domain/entities/location.entity';

@Injectable()
export class LocationRepositoryImpl implements LocationRepository {
  constructor(
    @InjectRepository(LocationModel)
    private readonly locationsRepo: Repository<LocationModel>,
  ) {}

  async findByQuery(
    query?: FindLocationsByQuery,
  ): Promise<TPaginationResponse<LocationModel>> {
    const qb = this.locationsRepo
      .createQueryBuilder('locations')
      .where(
        new Brackets((qb) => {
          if (!query?.includeDeletedLocation) {
            qb.andWhere('locations.deletedAt IS NULL');
          }
          if (typeof query?.keyword === 'string') {
            qb.andWhere(
              new Brackets((qb) => {
                qb.orWhere(
                  'locations.searchVector @@ websearch_to_tsquery(:config, :keyword)',
                  {
                    config: 'simple',
                    keyword: query.keyword,
                  },
                );
                qb.orWhere('locations.contactPhone ILIKE :likeKeyword', {
                  likeKeyword: `%${query.keyword}%`,
                });
                qb.orWhere('locations.contactName ILIKE :contactName', {
                  contactName: `%${query.keyword}%`,
                });
                qb.orWhere('locations.locationName ILIKE :locationName', {
                  locationName: `%${query.keyword}%`,
                });
                qb.orWhere('locations.address ILIKE :address', {
                  address: `%${query.keyword}%`,
                });
              }),
            );
          }
          if (typeof query?.userId === 'string') {
            qb.andWhere('locations.userId = :userId', {
              userId: query.userId,
            });
          }
          if (typeof query?.id === 'string') {
            qb.andWhere('locations.id = :id', {
              id: query.id,
            });
          }
        }),
      )
      .orderBy('locations.createdAt', 'DESC');
    if (typeof query?.pageNumber == 'number' && typeof query?.pageSize) {
      qb.take(query.pageSize);
      qb.skip((query.pageNumber - 1) * query.pageSize);
    }
    const res = await qb.getManyAndCount();
    return {
      data: res[0],
      meta: {
        pageSize: query.pageSize ?? Number.MAX_SAFE_INTEGER,
        totalCount: res[1],
        currentPage: query.pageNumber ?? 1,
      },
    };
  }

  async findByPhoneAndAddress(
    params: FindLocationsByPhoneAndAddress,
  ): Promise<TPaginationResponse<TLocation>> {
    const phone = params.contactPhone?.trim();
    const address = params.address?.trim();
    if (!phone && !address) {
      return {
        data: [],
        meta: {
          pageSize: params.pageSize ?? 0,
          totalCount: 0,
          currentPage: 1,
        },
      };
    }
    const qb = this.locationsRepo
      .createQueryBuilder('locations')
      .where('locations.deletedAt IS NULL');
    const normalizeAddress = `
    lower(
      regexp_replace(
        COALESCE(locations.address, ''),
        '[^[:alnum:][:space:]]',
        ' ',
        'g'
      )
    )
  `;
    const normalizedAddressParam = `
    lower(
      regexp_replace(
        :address,
        '[^[:alnum:][:space:]]',
        ' ',
        'g'
      )
    )
  `;
    const conditions: string[] = [];
    if (phone) {
      conditions.push(`
      locations.contactPhone = :phone
    `);

      qb.setParameter('phone', phone);
    }
    if (address) {
      conditions.push(`
      word_similarity(
        ${normalizedAddressParam},
        ${normalizeAddress}
      ) >= 0.35
    `);

      qb.setParameter('address', address);
    }

    qb.andWhere(`(${conditions.join(' OR ')})`);
    const phoneScore = phone
      ? `
      CASE
        WHEN locations.contactPhone = :phone
        THEN 100
        ELSE 0
      END
    `
      : '0';
    const addressScore = address
      ? `
      CASE
        WHEN ${normalizeAddress} = ${normalizedAddressParam}
        THEN 50

        ELSE (
          word_similarity(
            ${normalizedAddressParam},
            ${normalizeAddress}
          ) * 50
        )
      END
    `
      : '0';
    qb.addSelect(
      `
      (${phoneScore}) +
      (${addressScore})
    `,
      'total_score',
    );
    qb.orderBy('total_score', 'DESC');
    qb.addOrderBy('locations.createdAt', 'DESC');
    if (
      typeof params.pageNumber === 'number' &&
      typeof params.pageSize === 'number'
    ) {
      qb.take(params.pageSize);
      qb.skip((params.pageNumber - 1) * params.pageSize);
    }
    const [data, totalCount] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        pageSize: params.pageSize ?? Number.MAX_SAFE_INTEGER,
        totalCount,
        currentPage: params.pageNumber ?? 1,
      },
    };
  }

  create(data: CreateLocationData): Promise<TLocation> {
    return this.locationsRepo.save(this.locationsRepo.create(data));
  }

  update(locationId: string, data: UpdateLocationData): Promise<TLocation> {
    return this.locationsRepo.save(
      this.locationsRepo.create({
        ...data,
        id: locationId,
      }),
    );
  }
}
