import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { IProductRepository } from "@repositories/IProductRepository";
import Product from "@entities/Product";

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isAvailable: boolean;
  stock: number;
}

export class ProductGateway implements IProductRepository {
  private readonly dbConnection: IDatabaseConnection;
  private readonly tableName: string = "product";

  constructor(dbConnection: IDatabaseConnection) {
    this.dbConnection = dbConnection;
  }

  async create(product: Product): Promise<Product> {
    const productData = product.toJSON();
    const createdProduct = await this.dbConnection.create<ProductData>(
      this.tableName,
      productData
    );
    return new Product(
      createdProduct.id,
      createdProduct.name,
      createdProduct.description,
      createdProduct.price,
      createdProduct.categoryId,
      createdProduct.imageUrl,
      createdProduct.isAvailable,
      createdProduct.stock
    );
  }
  async findById(id: string): Promise<Product | null> {
    const product = await this.dbConnection.findById<ProductData>(
      this.tableName,
      id
    );
    if (!product) {
      return null;
    }
    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.categoryId,
      product.imageUrl,
      product.isAvailable,
      product.stock
    );
  }
  async findByName(name: string): Promise<Product | null> {
    const products = await this.dbConnection.findByField<ProductData>(
      this.tableName,
      "name",
      name
    );
    if (products.length === 0) {
      return null;
    }
    const product = products[0];
    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.categoryId,
      product.imageUrl,
      product.isAvailable,
      product.stock
    );
  }
  async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.dbConnection.findByField<ProductData>(
      this.tableName,
      "categoryId",
      categoryId
    );
    return products.map(
      (product) =>
        new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.categoryId,
          product.imageUrl,
          product.isAvailable,
          product.stock
        )
    );
  }
  async findAll(): Promise<Product[]> {
    const products = await this.dbConnection.findAll<ProductData>(
      this.tableName
    );
    return products.map(
      (product) =>
        new Product(
          product.id,
          product.name,
          product.description,
          product.price,
          product.categoryId,
          product.imageUrl,
          product.isAvailable,
          product.stock
        )
    );
  }

  async update(product: Product): Promise<Product> {
    const productData = product.toJSON();
    const updatedProduct = await this.dbConnection.update<ProductData>(
      this.tableName,
      product.id,
      productData
    );
    return new Product(
      updatedProduct.id,
      updatedProduct.name,
      updatedProduct.description,
      updatedProduct.price,
      updatedProduct.categoryId,
      updatedProduct.imageUrl,
      updatedProduct.isAvailable,
      updatedProduct.stock
    );
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.dbConnection.delete(this.tableName, id);
    if (!deleted) {
      throw new Error(`Product with ID ${id} not found`);
    }
  }

  async updateStock(productId: string, newStock: number): Promise<void> {
    await this.dbConnection.update(this.tableName, productId, {
      stock: newStock,
    });
  }
}
