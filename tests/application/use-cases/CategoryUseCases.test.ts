import CategoryUseCases from "@usecases/CategoryUseCases";
import Category from "@entities/Category";
import { ICategoryRepository } from "@repositories/ICategoryRepository";

describe("CategoryUseCases", () => {
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(() => {
    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
    };
  });

  describe("createCategory", () => {
    it("should create a category successfully", async () => {
      const category = new Category(
        "550e8400-e29b-41d4-a716-446655440010",
        "Burgers",
        "Delicious burgers"
      );
      mockCategoryRepository.create.mockResolvedValue(category);
      mockCategoryRepository.findByName.mockResolvedValue(null);

      const result = await CategoryUseCases.createCategory(
        "Burgers",
        "Delicious burgers",
        mockCategoryRepository
      );

      expect(result).toBe(category);
      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });
  });

  describe("findCategoryById", () => {
    it("should find category by id successfully", async () => {
      const category = new Category(
        "550e8400-e29b-41d4-a716-446655440011",
        "Burgers",
        "Delicious burgers"
      );
      mockCategoryRepository.findById.mockResolvedValue(category);

      const result = await CategoryUseCases.findCategoryById(
        "category-id",
        mockCategoryRepository
      );

      expect(result).toBe(category);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(
        "category-id"
      );
    });

    it("should throw error when category not found", async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        CategoryUseCases.findCategoryById(
          "non-existent-category",
          mockCategoryRepository
        )
      ).rejects.toThrow("Category not found");
    });
  });

  describe("updateCategory", () => {
    it("should update category successfully", async () => {
      const category = new Category(
        "550e8400-e29b-41d4-a716-446655440012",
        "Burgers",
        "Delicious burgers"
      );
      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.update.mockResolvedValue(category);

      const result = await CategoryUseCases.updateCategory(
        "category-id",
        "Premium Burgers",
        "Premium quality burgers",
        mockCategoryRepository
      );

      expect(result).toBe(category);
      expect(mockCategoryRepository.update).toHaveBeenCalled();
    });

    it("should throw error when category not found", async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        CategoryUseCases.updateCategory(
          "non-existent-category",
          "Premium Burgers",
          "Premium quality burgers",
          mockCategoryRepository
        )
      ).rejects.toThrow("Category not found");
    });
  });

  describe("deleteCategory", () => {
    it("should delete category successfully", async () => {
      const category = new Category(
        "550e8400-e29b-41d4-a716-446655440013",
        "Burgers",
        "Delicious burgers"
      );
      mockCategoryRepository.findById.mockResolvedValue(category);

      await CategoryUseCases.deleteCategory(
        "category-id",
        mockCategoryRepository
      );

      expect(mockCategoryRepository.delete).toHaveBeenCalledWith("category-id");
    });

    it("should throw error when category not found", async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(
        CategoryUseCases.deleteCategory(
          "non-existent-category",
          mockCategoryRepository
        )
      ).rejects.toThrow("Category not found");
    });
  });

  describe("findAllCategories", () => {
    it("should return all categories", async () => {
      const categories = [
        new Category(
          "550e8400-e29b-41d4-a716-446655440014",
          "Burgers",
          "Delicious burgers"
        ),
        new Category(
          "550e8400-e29b-41d4-a716-446655440015",
          "Drinks",
          "Refreshing drinks"
        ),
      ];
      mockCategoryRepository.findAll.mockResolvedValue(categories);

      const result = await CategoryUseCases.findAllCategories(
        mockCategoryRepository
      );

      expect(result).toBe(categories);
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });
  });
});
