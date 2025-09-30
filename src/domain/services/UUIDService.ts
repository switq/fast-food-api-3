export interface UUIDService {
  generate(): string;
  validate(id: string): boolean;
}
