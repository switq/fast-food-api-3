import { v4 as uuidv4 } from "uuid";
import OrderItem from "../../../src/domain/entities/OrderItem";

describe("OrderItem Entity", () => {
  const validId = uuidv4();
  const validOrderId = uuidv4();
  const validProductId = uuidv4();
  const validQuantity = 2;
  const validUnitPrice = 15.99;
  const validObservation = "Extra cheese, no onions";

  describe("Constructor", () => {
    it("should create an order item with valid data", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId,
        validObservation
      );

      expect(orderItem.id).toBe(validId);
      expect(orderItem.orderId).toBe(validOrderId);
      expect(orderItem.productId).toBe(validProductId);
      expect(orderItem.quantity).toBe(validQuantity);
      expect(orderItem.unitPrice).toBe(validUnitPrice);
      expect(orderItem.totalPrice).toBe(validQuantity * validUnitPrice);
      expect(orderItem.observation).toBe(validObservation);
    });

    it("should generate a new UUID if no ID is provided", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId
      );

      expect(orderItem.id).toBeDefined();
      expect(orderItem.id.length).toBe(36); // UUID length
    });

    it("should create order item without observation", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId
      );

      expect(orderItem.observation).toBeUndefined();
    });

    it("should throw error when ID is invalid", () => {
      expect(() => {
        new OrderItem(
          validProductId,
          validQuantity,
          validUnitPrice,
          validOrderId,
          "invalid-uuid"
        );
      }).toThrow("OrderItem ID must be a valid UUID");
    });

    it("should throw error when orderId is invalid", () => {
      expect(() => {
        new OrderItem(
          validProductId,
          validQuantity,
          validUnitPrice,
          "invalid-uuid"
        );
      }).toThrow("Order ID must be a valid UUID");
    });

    it("should throw error when productId is invalid", () => {
      expect(() => {
        new OrderItem(
          "invalid-uuid",
          validQuantity,
          validUnitPrice,
          validOrderId
        );
      }).toThrow("Product ID must be a valid UUID");
    });

    it("should throw error when quantity is zero", () => {
      expect(() => {
        new OrderItem(validProductId, 0, validUnitPrice, validOrderId);
      }).toThrow("Quantity must be greater than zero");
    });

    it("should throw error when quantity is negative", () => {
      expect(() => {
        new OrderItem(validProductId, -1, validUnitPrice, validOrderId);
      }).toThrow("Quantity must be greater than zero");
    });

    it("should throw error when quantity is not an integer", () => {
      expect(() => {
        new OrderItem(validProductId, 1.5, validUnitPrice, validOrderId);
      }).toThrow("Quantity must be an integer");
    });

    it("should throw error when unitPrice is negative", () => {
      expect(() => {
        new OrderItem(validProductId, validQuantity, -10, validOrderId);
      }).toThrow("Unit price cannot be negative");
    });
  });

  describe("Getters", () => {
    it("should return correct values through getters", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId,
        validObservation
      );

      expect(orderItem.id).toBe(validId);
      expect(orderItem.orderId).toBe(validOrderId);
      expect(orderItem.productId).toBe(validProductId);
      expect(orderItem.quantity).toBe(validQuantity);
      expect(orderItem.unitPrice).toBe(validUnitPrice);
      expect(orderItem.totalPrice).toBe(validQuantity * validUnitPrice);
      expect(orderItem.observation).toBe(validObservation);
    });
  });

  describe("Setters", () => {
    it("should update quantity with valid value and recalculate total price", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId
      );
      const newQuantity = 3;

      orderItem.quantity = newQuantity;
      expect(orderItem.quantity).toBe(newQuantity);
      expect(orderItem.totalPrice).toBe(newQuantity * validUnitPrice);
    });

    it("should throw error when setting invalid quantity", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId
      );

      expect(() => {
        orderItem.quantity = 0;
      }).toThrow("Quantity must be greater than zero");
    });

    it("should throw error when setting non-integer quantity", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId
      );

      expect(() => {
        orderItem.quantity = 1.5;
      }).toThrow("Quantity must be an integer");
    });
  });

  describe("toJSON", () => {
    it("should return correct JSON representation", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId,
        validObservation
      );
      const json = orderItem.toJSON();

      expect(json).toEqual({
        id: validId,
        orderId: validOrderId,
        productId: validProductId,
        quantity: validQuantity,
        unitPrice: validUnitPrice,
        totalPrice: validQuantity * validUnitPrice,
        observation: validObservation,
      });
    });

    it("should return JSON without observation when not provided", () => {
      const orderItem = new OrderItem(
        validProductId,
        validQuantity,
        validUnitPrice,
        validOrderId,
        validId
      );
      const json = orderItem.toJSON();

      expect(json).toEqual({
        id: validId,
        orderId: validOrderId,
        productId: validProductId,
        quantity: validQuantity,
        unitPrice: validUnitPrice,
        totalPrice: validQuantity * validUnitPrice,
        observation: undefined,
      });
    });
  });
});
