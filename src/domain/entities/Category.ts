import { v4 as uuidv4, validate as uuidValidate } from "uuid";

class Category {
  private _id: string;
  private _name: string;
  private _description: string;

  constructor(id: string = uuidv4(), name: string, description: string) {
    this.validateId(id);
    this.validateName(name);
    this.validateDescription(description);

    this._id = id;
    this._name = name;
    this._description = description;
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("Category ID cannot be empty");
    }
    if (!uuidValidate(id)) {
      throw new Error("Category ID must be a valid UUID");
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Category name cannot be empty");
    }
    if (name.length < 3) {
      throw new Error("Category name must be at least 3 characters long");
    }
    if (name.length > 50) {
      throw new Error("Category name cannot exceed 50 characters");
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error("Category description cannot be empty");
    }
    if (description.length > 255) {
      throw new Error("Category description cannot exceed 255 characters");
    }
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  // Setters
  set name(name: string) {
    this.validateName(name);
    this._name = name;
  }

  set description(description: string) {
    this.validateDescription(description);
    this._description = description;
  }

  // Note: No setter for ID as it should be immutable after creation

  // Utility method to convert to plain object
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
    };
  }
}

export default Category;
