import Category from "@entities/Category";

export interface ICategoryRepository {
  create(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
