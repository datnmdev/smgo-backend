import { ConfigService } from '@/core/config/config.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import ky from 'ky';

@Injectable()
export class LlamaSource {
  constructor(private readonly configService: ConfigService) {}

  async chat(prompt: string): Promise<string> {
    const response = await ky.post(this.configService.getAiConfig().llama.url, {
      json: {
        model: 'qwen2.5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
      },
      timeout: 30000,
    });

    const data = await response.json<{
      choices: Array<{ message: { content: string } }>;
    }>();
    return data.choices[0].message.content;
  }
}
