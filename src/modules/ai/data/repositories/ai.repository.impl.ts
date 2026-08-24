import { Injectable } from '@nestjs/common';
import { LlamaSource } from '../data_sources/llama';
import { AiRepository } from '../../domain/repositories/ai.repository';

@Injectable()
export class AiRepositoryImpl implements AiRepository {
  constructor(private readonly llamaDataSource: LlamaSource) {}

  chat(promt: string): Promise<string> {
    return this.llamaDataSource.chat(promt);
  }
}
