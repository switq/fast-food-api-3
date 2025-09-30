import ProductUseCases from "../../../src/application/use-cases/ProductUseCases";
import Product from "../../../src/domain/entities/Product";
import { IProductRepository } from "@repositories/IProductRepository";
import { ICategoryRepository } from "@repositories/ICategoryRepository";
import Category from "../../../src/domain/entities/Category";

describe("ProductUseCases", () => {
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockProductRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByCategory: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      updateStock: jest.fn(),
    };

    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      const category = new Category(
        "550e8400-e29b-41d4-a716-446655440020",
        "Burgers",
        "Delicious burgers"
      );
      const product = new Product(
        "550e8400-e29b-41d4-a716-446655440021",
        "Cheeseburger",
        "Classic cheeseburger",
        12.99,
        category.id,
        undefined,
        true
      );

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockProductRepository.create.mockResolvedValue(product);

      const result = await ProductUseCases.createProduct(
        "Cheeseburger",
        "Classic cheeseburger",
        12.99,
        category.id,
        undefined,
        mockProductRepository,
        mockCategoryRepository
      );

      expect(result).toBe(product);
      expect(mockProductRepository.create).toHaveBeenCalled();
    });

    it("should throw error when category not found", async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        ProductUseCases.createProduct(
          "Cheeseburger",
          "Classic cheeseburger",
          12.99,
          "non-existent-category",
          undefined,
          mockProductRepository,
          mockCategoryRepository
        )
      ).rejects.toThrow("Category not found");
    });
  });

  describe("findProductById", () => {
    it("should find product by id successfully", async () => {
      const product = new Product(
        "550e8400-e29b-41d4-a716-446655440022",
        "Cheeseburger",
        "Classic cheeseburger",
        12.99,
        "category-id",
        undefined,
        true
      );
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await ProductUseCases.findProductById(
        "product-id",
        mockProductRepository
      );

      expect(result).toBe(product);
      expect(mockProductRepository.findById).toHaveBeenCalledWith("product-id");
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        ProductUseCases.findProductById(
          "non-existent-product",
          mockProductRepository
        )
      ).rejects.toThrow("Product not found");
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const product = new Product(
        "550e8400-e29b-41d4-a716-446655440023",
        "Cheeseburger",
        "Classic cheeseburger",
        12.99,
        "category-id",
        undefined,
        true
      );
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.update.mockResolvedValue(product);

      const result = await ProductUseCases.updateProduct(
        "product-id",
        "Double Cheeseburger",
        "Double patty cheeseburger",
        15.99,
        undefined,
        undefined,
        true,
        mockProductRepository
      );

      expect(result).toBe(product);
      expect(mockProductRepository.update).toHaveBeenCalled();
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        ProductUseCases.updateProduct(
          "non-existent-product",
          "Double Cheeseburger",
          "Double patty cheeseburger",
          15.99,
          undefined,
          undefined,
          true,
          mockProductRepository
        )
      ).rejects.toThrow("Product not found");
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const product = new Product(
        "550e8400-e29b-41d4-a716-446655440024",
        "Cheeseburger",
        "Classic cheeseburger",
        12.99,
        "category-id",
        undefined,
        true
      );
      mockProductRepository.findById.mockResolvedValue(product);

      await ProductUseCases.deleteProduct("product-id", mockProductRepository);

      expect(mockProductRepository.delete).toHaveBeenCalledWith("product-id");
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        ProductUseCases.deleteProduct(
          "non-existent-product",
          mockProductRepository
        )
      ).rejects.toThrow("Product not found");
    });
  });

  describe("findAllProducts", () => {
    it("should return all products", async () => {
      const products = [
        new Product(
          "550e8400-e29b-41d4-a716-446655440025",
          "Cheeseburger",
          "Classic cheeseburger",
          12.99,
          "category-id",
          undefined,
          true
        ),
        new Product(
          "550e8400-e29b-41d4-a716-446655440026",
          "Fries",
          "Crispy fries",
          5.99,
          "category-id",
          undefined,
          true
        ),
      ];
      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await ProductUseCases.findAllProducts(
        mockProductRepository
      );

      expect(result).toBe(products);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });
  });
});
