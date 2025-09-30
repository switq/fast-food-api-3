import Product from "@entities/Product";
import { IProductRepository } from "@repositories/IProductRepository";
import { ICategoryRepository } from "@repositories/ICategoryRepository";

class ProductUseCases {
  static async createProduct(
    name: string,
    description: string,
    price: number,
    categoryId: string,
    imageUrl: string | undefined,
    repository: IProductRepository,
    categoryRepository: ICategoryRepository
  ): Promise<Product> {
    const existingProduct = await repository.findByName(name);
    if (existingProduct) {
      throw new Error("A product with this name already exists");
    }

    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const product = new Product(
      undefined,
      name,
      description,
      price,
      categoryId,
      imageUrl
    );
    return repository.create(product);
  }

  static async findProductById(
    id: string,
    repository: IProductRepository
  ): Promise<Product> {
    const product = await repository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  static async findProductByName(
    name: string,
    repository: IProductRepository
  ): Promise<Product> {
    const product = await repository.findByName(name);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }

  static async findProductsByCategory(
    categoryId: string,
    repository: IProductRepository
  ): Promise<Product[]> {
    return repository.findByCategory(categoryId);
  }

  static async findAllProducts(
    repository: IProductRepository
  ): Promise<Product[]> {
    return repository.findAll();
  }

  static async updateProduct(
    id: string,
    name: string | undefined,
    description: string | undefined,
    price: number | undefined,
    categoryId: string | undefined,
    imageUrl: string | undefined,
    isAvailable: boolean | undefined,
    repository: IProductRepository
  ): Promise<Product> {
    const existingProduct = await repository.findById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    if (name !== undefined && name !== existingProduct.name) {
      const productWithSameName = await repository.findByName(name);
      if (productWithSameName) {
        throw new Error("A product with this name already exists");
      }
      existingProduct.name = name;
    }
    if (description !== undefined) {
      existingProduct.description = description;
    }
    if (price !== undefined) {
      existingProduct.price = price;
    }
    if (categoryId !== undefined) {
      existingProduct.categoryId = categoryId;
    }
    if (imageUrl !== undefined) {
      existingProduct.imageUrl = imageUrl;
    }
    if (isAvailable !== undefined) {
      existingProduct.isAvailable = isAvailable;
    }
    return repository.update(existingProduct);
  }

  static async deleteProduct(
    id: string,
    repository: IProductRepository
  ): Promise<void> {
    const product = await repository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    await repository.delete(id);
  }
}

export default ProductUseCases;
