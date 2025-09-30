import { v4 as uuidv4 } from "uuid";
import Product from "../../../src/domain/entities/Product";

describe("Product Entity", () => {
  const validId = uuidv4();
  const validName = "Cheeseburger";
  const validDescription = "Delicious cheeseburger with special sauce";
  const validPrice = 15.99;
  const validCategoryId = uuidv4();
  const validImageUrl = "https://example.com/cheeseburger.jpg";

  describe("Constructor", () => {
    it("should create a product with valid data", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId,
        validImageUrl
      );

      expect(product.id).toBe(validId);
      expect(product.name).toBe(validName);
      expect(product.description).toBe(validDescription);
      expect(product.price).toBe(validPrice);
      expect(product.categoryId).toBe(validCategoryId);
      expect(product.imageUrl).toBe(validImageUrl);
      expect(product.isAvailable).toBe(true);
    });

    it("should generate a new UUID if no ID is provided", () => {
      const product = new Product(
        undefined,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );

      expect(product.id).toBeDefined();
      expect(product.id.length).toBe(36); // UUID length
    });

    it("should create product without imageUrl", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );

      expect(product.imageUrl).toBeUndefined();
    });

    it("should throw error when ID is invalid", () => {
      expect(() => {
        new Product(
          "invalid-uuid",
          validName,
          validDescription,
          validPrice,
          validCategoryId
        );
      }).toThrow("Product ID must be a valid UUID");
    });

    it("should throw error when name is empty", () => {
      expect(() => {
        new Product(validId, "", validDescription, validPrice, validCategoryId);
      }).toThrow("Product name cannot be empty");
    });

    it("should throw error when name is too short", () => {
      expect(() => {
        new Product(
          validId,
          "Ab",
          validDescription,
          validPrice,
          validCategoryId
        );
      }).toThrow("Product name must be at least 3 characters long");
    });

    it("should throw error when name is too long", () => {
      const longName = "A".repeat(101);
      expect(() => {
        new Product(
          validId,
          longName,
          validDescription,
          validPrice,
          validCategoryId
        );
      }).toThrow("Product name cannot exceed 100 characters");
    });

    it("should throw error when description is empty", () => {
      expect(() => {
        new Product(validId, validName, "", validPrice, validCategoryId);
      }).toThrow("Product description cannot be empty");
    });

    it("should throw error when description is too long", () => {
      const longDescription = "A".repeat(501);
      expect(() => {
        new Product(
          validId,
          validName,
          longDescription,
          validPrice,
          validCategoryId
        );
      }).toThrow("Product description cannot exceed 500 characters");
    });

    it("should throw error when price is negative", () => {
      expect(() => {
        new Product(validId, validName, validDescription, -10, validCategoryId);
      }).toThrow("Product price cannot be negative");
    });

    it("should throw error when categoryId is empty", () => {
      expect(() => {
        new Product(validId, validName, validDescription, validPrice, "");
      }).toThrow("Category ID cannot be empty");
    });
  });

  describe("Getters", () => {
    it("should return correct values through getters", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId,
        validImageUrl
      );

      expect(product.id).toBe(validId);
      expect(product.name).toBe(validName);
      expect(product.description).toBe(validDescription);
      expect(product.price).toBe(validPrice);
      expect(product.categoryId).toBe(validCategoryId);
      expect(product.imageUrl).toBe(validImageUrl);
      expect(product.isAvailable).toBe(true);
    });
  });

  describe("Setters", () => {
    it("should update name with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );
      const newName = "New Product Name";

      product.name = newName;
      expect(product.name).toBe(newName);
    });

    it("should update description with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );
      const newDescription = "New product description";

      product.description = newDescription;
      expect(product.description).toBe(newDescription);
    });

    it("should update price with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );
      const newPrice = 19.99;

      product.price = newPrice;
      expect(product.price).toBe(newPrice);
    });

    it("should update categoryId with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );
      const newCategoryId = uuidv4();

      product.categoryId = newCategoryId;
      expect(product.categoryId).toBe(newCategoryId);
    });

    it("should update imageUrl with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );
      const newImageUrl = "https://example.com/new-image.jpg";

      product.imageUrl = newImageUrl;
      expect(product.imageUrl).toBe(newImageUrl);
    });

    it("should update isAvailable with valid value", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );

      product.isAvailable = false;
      expect(product.isAvailable).toBe(false);
    });

    it("should throw error when setting invalid name", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );

      expect(() => {
        product.name = "Ab";
      }).toThrow("Product name must be at least 3 characters long");
    });

    it("should throw error when setting invalid price", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId
      );

      expect(() => {
        product.price = -10;
      }).toThrow("Product price cannot be negative");
    });
  });

  describe("toJSON", () => {
    it("should return correct JSON representation", () => {
      const product = new Product(
        validId,
        validName,
        validDescription,
        validPrice,
        validCategoryId,
        validImageUrl
      );
      const json = product.toJSON();

      expect(json).toEqual({
        id: validId,
        name: validName,
        description: validDescription,
        price: validPrice,
        categoryId: validCategoryId,
        imageUrl: validImageUrl,
        isAvailable: true,
        stock: 0,
      });
    });
  });
});
