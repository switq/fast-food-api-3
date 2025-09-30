import { v4 as uuidv4, validate as uuidValidate } from "uuid";

class Product {
  private _id: string;
  private _name: string;
  private _description: string;
  private _price: number;
  private _categoryId: string;
  private _imageUrl?: string;
  private _isAvailable: boolean;
  private _stock: number = 0;

  constructor(
    id: string = uuidv4(),
    name: string,
    description: string,
    price: number,
    categoryId: string,
    imageUrl?: string,
    isAvailable: boolean = true,
    stock: number = 0
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateDescription(description);
    this.validatePrice(price);
    this.validateCategoryId(categoryId);
    if (imageUrl) {
      this.validateImageUrl(imageUrl);
    }

    this._id = id;
    this._name = name;
    this._description = description;
    this._price = price;
    this._categoryId = categoryId;
    this._imageUrl = imageUrl;
    this._isAvailable = isAvailable;
    this.stock = stock;
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("Product ID cannot be empty");
    }
    if (!uuidValidate(id)) {
      throw new Error("Product ID must be a valid UUID");
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Product name cannot be empty");
    }
    if (name.length < 3) {
      throw new Error("Product name must be at least 3 characters long");
    }
    if (name.length > 100) {
      throw new Error("Product name cannot exceed 100 characters");
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error("Product description cannot be empty");
    }
    if (description.length > 500) {
      throw new Error("Product description cannot exceed 500 characters");
    }
  }

  private validatePrice(price: number): void {
    if (price === undefined || price === null) {
      throw new Error("Product price cannot be empty");
    }
    if (price < 0) {
      throw new Error("Product price cannot be negative");
    }
  }

  private validateCategoryId(categoryId: string): void {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error("Category ID cannot be empty");
    }
  }

  private validateImageUrl(imageUrl: string): void {
    // Only validate URL format if a value is provided
    try {
      new URL(imageUrl);
    } catch {
      throw new Error("Invalid image URL format");
    }
  }

  private validateStock(stock: number): void {
    if (stock < 0) {
      throw new Error("Product stock cannot be negative");
    }
    if (!Number.isInteger(stock)) {
      throw new Error("Product stock must be an integer");
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

  get price(): number {
    return this._price;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get imageUrl(): string | undefined {
    return this._imageUrl;
  }

  get isAvailable(): boolean {
    return this._isAvailable;
  }

  get stock(): number {
    return this._stock;
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

  set price(price: number) {
    this.validatePrice(price);
    this._price = price;
  }

  set categoryId(categoryId: string) {
    this.validateCategoryId(categoryId);
    this._categoryId = categoryId;
  }

  set imageUrl(imageUrl: string | undefined) {
    if (imageUrl) {
      this.validateImageUrl(imageUrl);
    }
    this._imageUrl = imageUrl;
  }

  set isAvailable(isAvailable: boolean) {
    this._isAvailable = isAvailable;
  }

  set stock(stock: number) {
    this.validateStock(stock);
    this._stock = stock;
  }

  // Note: No setter for ID as it should be immutable after creation

  // Utility method to convert to plain object
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      description: this._description,
      price: this._price,
      categoryId: this._categoryId,
      imageUrl: this._imageUrl,
      isAvailable: this._isAvailable,
      stock: this._stock,
    };
  }
}

export default Product;
