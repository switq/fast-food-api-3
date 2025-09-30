import { v4 as uuidv4 } from "uuid";
import Order, { OrderStatus } from "../../../src/domain/entities/Order";
import OrderItem from "../../../src/domain/entities/OrderItem";

describe("Order Entity", () => {
  const validId = uuidv4();
  const validCustomerId = uuidv4();
  const validProductId = uuidv4();
  const validOrderItem = new OrderItem(validProductId, 2, 15.99, validId);

  describe("Constructor", () => {
    it("should create an order with valid data", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);

      expect(order.id).toBe(validId);
      expect(order.customerId).toBe(validCustomerId);
      expect(order.items).toHaveLength(1);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe("pending");
      expect(order.totalAmount).toBe(validOrderItem.totalPrice);
      expect(order.createdAt).toBeInstanceOf(Date);
      expect(order.updatedAt).toBeInstanceOf(Date);
    });

    it("should generate a new UUID if no ID is provided", () => {
      const order = new Order(undefined, validCustomerId, [validOrderItem]);

      expect(order.id).toBeDefined();
      expect(order.id.length).toBe(36); // UUID length
    });

    it("should throw error when ID is invalid", () => {
      expect(() => {
        new Order("invalid-uuid", validCustomerId, [validOrderItem]);
      }).toThrow("Order ID must be a valid UUID");
    });

    it("should throw error when customerId is invalid", () => {
      expect(() => {
        new Order(validId, "invalid-uuid", [validOrderItem]);
      }).toThrow("Customer ID must be a valid UUID");
    });

    it("should throw error when items is not an array", () => {
      expect(() => {
        new Order(validId, validCustomerId, null as any);
      }).toThrow("Items must be an array");
    });

    it("should accept empty items array in constructor", () => {
      const order = new Order(validId, validCustomerId, []);
      expect(order.items).toHaveLength(0);
    });

    it("should throw error when confirming order with empty items", () => {
      const order = new Order(validId, validCustomerId, []);
      expect(() => {
        order.confirm();
      }).toThrow("Order must have at least one item");
    });
  });

  describe("Status Transitions", () => {
    it("should transition from PENDING to CONFIRMED", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    it("should transition from CONFIRMED to PAYMENT_CONFIRMED", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      order.confirmPayment();
      expect(order.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
    });

    it("should transition from PAYMENT_CONFIRMED to PREPARING", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      order.confirmPayment();
      order.startPreparing();
      expect(order.status).toBe(OrderStatus.PREPARING);
    });

    it("should transition from PREPARING to READY", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      order.confirmPayment();
      order.startPreparing();
      order.markAsReady();
      expect(order.status).toBe(OrderStatus.READY);
    });

    it("should transition from READY to DELIVERED", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      order.confirmPayment();
      order.startPreparing();
      order.markAsReady();
      order.markAsDelivered();
      expect(order.status).toBe(OrderStatus.DELIVERED);
    });

    it("should throw error when confirming non-pending order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      expect(() => {
        order.confirm();
      }).toThrow("Order can only be confirmed when in PENDING status");
    });

    it("should throw error when confirming payment of non-confirmed order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      expect(() => {
        order.confirmPayment();
      }).toThrow(
        "Payment can only be confirmed when order is in CONFIRMED status"
      );
    });

    it("should throw error when starting preparation of non-payment-confirmed order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      expect(() => {
        order.startPreparing();
      }).toThrow("Order can only start preparing when payment is confirmed");
    });

    it("should throw error when marking non-preparing order as ready", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      expect(() => {
        order.markAsReady();
      }).toThrow("Order can only be marked as ready when it is being prepared");
    });

    it("should throw error when marking non-ready order as delivered", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      expect(() => {
        order.markAsDelivered();
      }).toThrow("Order can only be marked as delivered when it is ready");
    });

    it("should throw error when cancelling delivered order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      order.confirmPayment();
      order.startPreparing();
      order.markAsReady();
      order.markAsDelivered();
      expect(() => {
        order.cancel();
      }).toThrow("Cannot cancel an order that has been delivered");
    });

    it("should throw error when cancelling already cancelled order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.cancel();
      expect(() => {
        order.cancel();
      }).toThrow("Order is already cancelled");
    });
  });

  describe("Item Management", () => {
    it("should add a single item", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const newItem = new OrderItem(uuidv4(), 1, 10.99, validId);

      order.addItem(newItem);
      expect(order.items).toHaveLength(2);
      expect(order.totalAmount).toBe(
        validOrderItem.totalPrice + newItem.totalPrice
      );
    });

    it("should add multiple items", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const newItems = [
        new OrderItem(uuidv4(), 1, 10.99, validId),
        new OrderItem(uuidv4(), 2, 8.99, validId),
      ];

      order.addItem(newItems);
      expect(order.items).toHaveLength(3);
      expect(order.totalAmount).toBe(
        validOrderItem.totalPrice +
          newItems[0].totalPrice +
          newItems[1].totalPrice
      );
    });

    it("should remove a single item", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const itemToRemove = new OrderItem(uuidv4(), 1, 10.99, validId);
      order.addItem(itemToRemove);

      order.removeItem(itemToRemove.id);
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(validOrderItem.totalPrice);
    });

    it("should remove multiple items", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const itemsToRemove = [
        new OrderItem(uuidv4(), 1, 10.99, validId),
        new OrderItem(uuidv4(), 2, 8.99, validId),
      ];
      order.addItem(itemsToRemove);

      order.removeItem(itemsToRemove.map((item) => item.id));
      expect(order.items).toHaveLength(1);
      expect(order.totalAmount).toBe(validOrderItem.totalPrice);
    });

    it("should update item quantity", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const newQuantity = 3;

      order.updateItemQuantity(validOrderItem.id, newQuantity);
      expect(order.items[0].quantity).toBe(newQuantity);
      expect(order.totalAmount).toBe(validOrderItem.unitPrice * newQuantity);
    });

    it("should throw error when adding items to non-pending order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();
      const newItem = new OrderItem(uuidv4(), 1, 10.99, validId);

      expect(() => {
        order.addItem(newItem);
      }).toThrow("Cannot add items to an order that is not pending");
    });

    it("should throw error when removing items from non-pending order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();

      expect(() => {
        order.removeItem(validOrderItem.id);
      }).toThrow("Cannot remove items from an order that is not pending");
    });

    it("should throw error when updating item quantity in non-pending order", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      order.confirm();

      expect(() => {
        order.updateItemQuantity(validOrderItem.id, 3);
      }).toThrow("Cannot update items in an order that is not pending");
    });

    it("should throw error when updating non-existent item quantity", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);

      expect(() => {
        order.updateItemQuantity("non-existent-id", 3);
      }).toThrow("Item not found in order");
    });
  });

  describe("toJSON", () => {
    it("should return correct JSON representation", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const json = order.toJSON();

      expect(json).toEqual({
        id: validId,
        customerId: validCustomerId,
        items: [validOrderItem.toJSON()],
        status: OrderStatus.PENDING,
        paymentStatus: "pending",
        totalAmount: validOrderItem.totalPrice,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe("Payment Status", () => {
    it("should set payment status", () => {
      const order = new Order(validId, validCustomerId, [validOrderItem]);
      const newPaymentStatus = "approved";

      order.setPaymentStatus(newPaymentStatus);
      expect(order.paymentStatus).toBe(newPaymentStatus);
    });
  });
});
