import { v4 as uuidv4, validate as uuidValidate } from "uuid";

class OrderItem {
  private _id: string;
  private _orderId?: string; // now optional
  private _productId: string;
  private _quantity: number;
  private _unitPrice: number;
  private _observation?: string;

  constructor(
    productId: string,
    quantity: number,
    unitPrice: number,
    orderId?: string,
    id?: string,
    observation?: string
  ) {
    this._id = id ?? uuidv4();
    this._orderId = orderId;
    this._productId = productId;
    this._quantity = quantity;
    this._unitPrice = unitPrice;
    this._observation = observation;

    // Validate all parameters
    this.validateId(this._id);
    this.validateProductId(this._productId);
    this.validateQuantity(this._quantity);
    this.validateUnitPrice(this._unitPrice);
    if (this._orderId) {
      this.validateOrderId(this._orderId);
    }
    if (this._observation) {
      this.validateObservation(this._observation);
    }
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("OrderItem ID cannot be empty");
    }
    if (!uuidValidate(id)) {
      throw new Error("OrderItem ID must be a valid UUID");
    }
  }

  private validateOrderId(orderId: string): void {
    if (!orderId || orderId.trim().length === 0) {
      throw new Error("Order ID cannot be empty");
    }
    if (!uuidValidate(orderId)) {
      throw new Error("Order ID must be a valid UUID");
    }
  }

  private validateProductId(productId: string): void {
    if (!productId || productId.trim().length === 0) {
      throw new Error("Product ID cannot be empty");
    }
    if (!uuidValidate(productId)) {
      throw new Error("Product ID must be a valid UUID");
    }
  }

  private validateQuantity(quantity: number): void {
    if (quantity === undefined || quantity === null) {
      throw new Error("Quantity cannot be empty");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }
    if (!Number.isInteger(quantity)) {
      throw new Error("Quantity must be an integer");
    }
  }

  private validateUnitPrice(unitPrice: number): void {
    if (unitPrice === undefined || unitPrice === null) {
      throw new Error("Unit price cannot be empty");
    }
    if (unitPrice < 0) {
      throw new Error("Unit price cannot be negative");
    }
  }

  private validateObservation(observation: string): void {
    if (observation.length > 255) {
      throw new Error("Observation cannot exceed 255 characters");
    }
  }

  private calculateTotalPrice(): number {
    return this.quantity * this.unitPrice;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get orderId(): string | undefined {
    return this._orderId;
  }

  get productId(): string {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get totalPrice(): number {
    return this._quantity * this._unitPrice;
  }

  get observation(): string | undefined {
    return this._observation;
  }

  // Setters
  set quantity(quantity: number) {
    this.validateQuantity(quantity);
    this._quantity = quantity;
  }

  set unitPrice(unitPrice: number) {
    this.validateUnitPrice(unitPrice);
    this._unitPrice = unitPrice;
  }

  set observation(observation: string | undefined) {
    if (observation) {
      this.validateObservation(observation);
    }
    this._observation = observation;
  }

  // Note: No setters for id, orderId, and productId as they should be immutable after creation

  // Utility method to convert to plain object
  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice,
      observation: this.observation,
    };
  }
}

export default OrderItem;
