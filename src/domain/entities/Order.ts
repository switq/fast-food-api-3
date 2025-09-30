import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import OrderItem from "./OrderItem";

enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PAYMENT_CONFIRMED = "PAYMENT_CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

class Order {
  private _id: string;
  private _customerId?: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _paymentStatus: string; // Could be an enum in the future
  private _totalAmount: number;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _paymentProviderId?: string; // new field
  private _orderNumber?: number;
  constructor(
    id: string = uuidv4(),
    customerId?: string,
    items: OrderItem[] = [],
    status: OrderStatus = OrderStatus.PENDING,
    paymentStatus: string = "pending",
    paymentProviderId?: string
  ) {
    this.validateId(id);
    if (customerId) {
      this.validateCustomerId(customerId);
    }
    this.validateItemsArray(items);

    this._id = id;
    this._customerId = customerId;
    this._items = items;
    this._status = status;
    this._paymentStatus = paymentStatus;
    this._paymentProviderId = paymentProviderId;
    this._totalAmount = this.calculateTotalAmount();
    this._createdAt = new Date();
    this._updatedAt = new Date();
    // orderNumber will be generated only when order is confirmed
    this._orderNumber = undefined;
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("Order ID cannot be empty");
    }
    if (!uuidValidate(id)) {
      throw new Error("Order ID must be a valid UUID");
    }
  }

  private validateCustomerId(customerId: string): void {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error("Customer ID cannot be empty");
    }
    if (!uuidValidate(customerId)) {
      throw new Error("Customer ID must be a valid UUID");
    }
  }

  private validateItemsArray(items: OrderItem[]): void {
    if (!Array.isArray(items)) {
      throw new Error("Items must be an array");
    }
  }

  private validateItems(items: OrderItem[]): void {
    if (!Array.isArray(items)) {
      throw new Error("Items must be an array");
    }
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }
  }

  private calculateTotalAmount(): number {
    return this._items.reduce((total, item) => total + item.totalPrice, 0);
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get customerId(): string | undefined {
    return this._customerId;
  }

  get items(): OrderItem[] {
    return [...this._items]; // Return a copy to prevent direct modification
  }

  get status(): OrderStatus {
    return this._status;
  }

  get paymentStatus(): string {
    return this._paymentStatus;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  get paymentProviderId(): string | undefined {
    return this._paymentProviderId;
  }

  get orderNumber(): number | undefined {
    return this._orderNumber;
  }
  // Status transition methods
  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Order can only be confirmed when in PENDING status");
    }

    // Validate that order has at least one item before confirming
    this.validateItems(this._items);

    this._status = OrderStatus.CONFIRMED;
    this._updatedAt = new Date();

    // Generate orderNumber only when confirming the order
    if (!this._orderNumber) {
      this._orderNumber = this.generateOrderNumber();
    }
  }
  private generateOrderNumber(): number {
    // Generate simple sequential daily number (1, 2, 3...)
    // In production, this would query the database for today's count + 1
    // For now, using a simple incremental approach based on timestamp
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const timeOfDay = today.getHours() * 60 + today.getMinutes();

    // Generate a number between 1-999 for demo purposes
    // In real implementation, this should be: SELECT COUNT(*) + 1 FROM orders WHERE DATE(createdAt) = CURRENT_DATE
    return ((dayOfYear + timeOfDay) % 999) + 1;
  }

  confirmPayment(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new Error(
        "Payment can only be confirmed when order is in CONFIRMED status"
      );
    }
    this._status = OrderStatus.PAYMENT_CONFIRMED;
    this._updatedAt = new Date();
  }

  startPreparing(): void {
    if (this._status !== OrderStatus.PAYMENT_CONFIRMED) {
      throw new Error(
        "Order can only start preparing when payment is confirmed"
      );
    }
    this._status = OrderStatus.PREPARING;
    this._updatedAt = new Date();
  }

  markAsReady(): void {
    if (this._status !== OrderStatus.PREPARING) {
      throw new Error(
        "Order can only be marked as ready when it is being prepared"
      );
    }
    this._status = OrderStatus.READY;
    this._updatedAt = new Date();
  }

  markAsDelivered(): void {
    if (this._status !== OrderStatus.READY) {
      throw new Error("Order can only be marked as delivered when it is ready");
    }
    this._status = OrderStatus.DELIVERED;
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === OrderStatus.DELIVERED) {
      throw new Error("Cannot cancel an order that has been delivered");
    }
    if (this._status === OrderStatus.CANCELLED) {
      throw new Error("Order is already cancelled");
    }
    this._status = OrderStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  // Methods to manage items
  addItem(items: OrderItem | OrderItem[]): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot add items to an order that is not pending");
    }

    const itemsToAdd = Array.isArray(items) ? items : [items];

    if (itemsToAdd.length === 0) {
      throw new Error("Cannot add empty list of items");
    }

    this._items.push(...itemsToAdd);
    this._totalAmount = this.calculateTotalAmount();
    this._updatedAt = new Date();
  }

  removeItem(itemIds: string | string[]): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot remove items from an order that is not pending");
    }

    const idsToRemove = Array.isArray(itemIds) ? itemIds : [itemIds];

    if (idsToRemove.length === 0) {
      throw new Error("Cannot remove empty list of items");
    }

    const initialLength = this._items.length;
    this._items = this._items.filter((item) => !idsToRemove.includes(item.id));

    if (this._items.length === initialLength) {
      throw new Error("No items found to remove");
    }

    this._totalAmount = this.calculateTotalAmount();
    this._updatedAt = new Date();
  }

  updateItemQuantity(itemId: string, quantity: number): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error("Cannot update items in an order that is not pending");
    }

    const item = this._items.find((item) => item.id === itemId);
    if (!item) {
      throw new Error("Item not found in order");
    }

    item.quantity = quantity;
    this._totalAmount = this.calculateTotalAmount();
    this._updatedAt = new Date();
  }

  setPaymentStatus(status: string): void {
    this._paymentStatus = status;
    this._updatedAt = new Date();
  }

  setPaymentProviderId(id: string): void {
    this._paymentProviderId = id;
    this._updatedAt = new Date();
  }

  setOrderNumber(orderNumber: number): void {
    this._orderNumber = orderNumber;
    this._updatedAt = new Date();
  }

  // Utility method to convert to plain object
  toJSON() {
    return {
      id: this._id,
      customerId: this._customerId,
      items: this._items.map((item) => item.toJSON()),
      status: this._status,
      paymentStatus: this._paymentStatus,
      totalAmount: this._totalAmount,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      paymentProviderId: this._paymentProviderId,
      orderNumber: this._orderNumber,
    };
  }
}

export { OrderStatus };
export default Order;
