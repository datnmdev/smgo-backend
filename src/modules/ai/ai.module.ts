import { Module } from '@nestjs/common';
import { ExtractController } from './presentation/controllers/extract.controller';
import { AiRepository } from './domain/repositories/ai.repository';
import { AiRepositoryImpl } from './data/repositories/ai.repository.impl';
import { LlamaSource } from './data/data_sources/llama';
import { ExtractOrderInfoUsecase } from './domain/usecases/extract-order-info.usecase';
import { ConfigModule } from '@/core/config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [ExtractController],
  providers: [
    // Repositories
    LlamaSource,
    {
      provide: AiRepository,
      useClass: AiRepositoryImpl,
    },

    // Usecases
    ExtractOrderInfoUsecase,
  ],
  exports: [],
})
export class AiModule {}
