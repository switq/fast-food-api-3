import { v4 as uuidv4 } from "uuid";
import Category from "@entities/Category";

describe("Category Entity", () => {
  const validId = uuidv4();
  const validName = "Beverages";
  const validDescription = "All types of drinks and beverages";

  describe("Constructor", () => {
    it("should create a category with valid data", () => {
      const category = new Category(validId, validName, validDescription);

      expect(category.id).toBe(validId);
      expect(category.name).toBe(validName);
      expect(category.description).toBe(validDescription);
    });

    it("should generate a new UUID if no ID is provided", () => {
      const category = new Category(undefined, validName, validDescription);

      expect(category.id).toBeDefined();
      expect(category.id.length).toBe(36); // UUID length
    });

    it("should throw error when ID is invalid", () => {
      expect(() => {
        // purposely not assigning the instance, we want the constructor to throw
        return new Category("invalid-uuid", validName, validDescription);
      }).toThrow("Category ID must be a valid UUID");
    });

    it("should throw error when name is empty", () => {
      expect(() => {
        return new Category(validId, "", validDescription);
      }).toThrow("Category name cannot be empty");
    });

    it("should throw error when name is too short", () => {
      expect(() => {
        return new Category(validId, "Ab", validDescription);
      }).toThrow("Category name must be at least 3 characters long");
    });

    it("should throw error when name is too long", () => {
      const longName = "A".repeat(51);
      expect(() => {
        return new Category(validId, longName, validDescription);
      }).toThrow("Category name cannot exceed 50 characters");
    });

    it("should throw error when description is empty", () => {
      expect(() => {
        return new Category(validId, validName, "");
      }).toThrow("Category description cannot be empty");
    });

    it("should throw error when description is too long", () => {
      const longDescription = "A".repeat(256);
      expect(() => {
        return new Category(validId, validName, longDescription);
      }).toThrow("Category description cannot exceed 255 characters");
    });
  });

  describe("Getters", () => {
    it("should return correct values through getters", () => {
      const category = new Category(validId, validName, validDescription);

      expect(category.id).toBe(validId);
      expect(category.name).toBe(validName);
      expect(category.description).toBe(validDescription);
    });
  });

  describe("Setters", () => {
    it("should update name with valid value", () => {
      const category = new Category(validId, validName, validDescription);
      const newName = "New Category Name";

      category.name = newName;
      expect(category.name).toBe(newName);
    });

    it("should update description with valid value", () => {
      const category = new Category(validId, validName, validDescription);
      const newDescription = "New category description";

      category.description = newDescription;
      expect(category.description).toBe(newDescription);
    });

    it("should throw error when setting invalid name", () => {
      const category = new Category(validId, validName, validDescription);

      expect(() => {
        category.name = "Ab";
      }).toThrow("Category name must be at least 3 characters long");
    });

    it("should throw error when setting invalid description", () => {
      const category = new Category(validId, validName, validDescription);
      const longDescription = "A".repeat(256);

      expect(() => {
        category.description = longDescription;
      }).toThrow("Category description cannot exceed 255 characters");
    });
  });

  describe("toJSON", () => {
    it("should return correct JSON representation", () => {
      const category = new Category(validId, validName, validDescription);
      const json = category.toJSON();

      expect(json).toEqual({
        id: validId,
        name: validName,
        description: validDescription,
      });
    });
  });
});
