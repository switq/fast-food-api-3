import Product from "@entities/Product";

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(productId: string, newStock: number): Promise<void>;
}
