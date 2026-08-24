export abstract class AiRepository {
  abstract chat(promt: string): Promise<string>;
}
