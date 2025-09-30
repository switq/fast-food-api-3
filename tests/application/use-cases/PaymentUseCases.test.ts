import PaymentUseCases from "../../../src/application/use-cases/PaymentUseCases";
import Order, { OrderStatus } from "../../../src/domain/entities/Order";
import OrderItem from "../../../src/domain/entities/OrderItem";
import { IOrderRepository } from "@repositories/IOrderRepository";
import { IPaymentGateway, PaymentStatus } from "@app-gateways/IPaymentGateway";
import { v4 as uuidv4 } from "uuid";

describe("PaymentUseCases", () => {
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockPaymentGateway: jest.Mocked<IPaymentGateway>;
  beforeEach(() => {
    mockOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      findAllSorted: jest.fn(),
      findByStatus: jest.fn(),
    };

    mockPaymentGateway = {
      createPayment: jest.fn(),
      getPaymentStatus: jest.fn(),
    };
  });

  describe("handleWebhookNotification", () => {
    it("should update order status when payment is approved", async () => {
      const order = new Order(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440011",
        [
          new OrderItem(
            "550e8400-e29b-41d4-a716-446655440031",
            1,
            10,
            "550e8400-e29b-41d4-a716-446655440001",
            "550e8400-e29b-41d4-a716-446655440021",
            "test"
          ),
        ]
      );
      order.confirm(); // The order must be confirmed before payment can be confirmed
      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.APPROVED,
        externalReference: "550e8400-e29b-41d4-a716-446655440001",
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.paymentStatus).toBe(PaymentStatus.APPROVED);
      expect(order.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });

    it("should not update order status when payment is not approved", async () => {
      const order = new Order(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440011"
      );
      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.REJECTED,
        externalReference: "550e8400-e29b-41d4-a716-446655440001",
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.paymentStatus).toBe(PaymentStatus.REJECTED);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });
  });

  describe("getPaymentStatus", () => {
    it("should return payment status of an order", async () => {
      const order = new Order(
        "550e8400-e29b-41d4-a716-446655440001",
        "550e8400-e29b-41d4-a716-446655440011",
        [],
        undefined,
        "approved"
      );
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await PaymentUseCases.getPaymentStatus(
        "550e8400-e29b-41d4-a716-446655440001",
        mockOrderRepository
      );

      expect(result).toBe("approved");
    });

    it("should return null when order not found", async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await PaymentUseCases.getPaymentStatus(
        "non-existent-order",
        mockOrderRepository
      );

      expect(result).toBe(null);
    });
  });

  describe("createPayment", () => {
    it("should create payment for confirmed order without customer", async () => {
      const order = new Order();
      const productId = uuidv4();
      const orderId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, orderId, itemId, "No onions"),
      ]);
      order.confirm(); // Confirm the order so it can accept payment

      const paymentResult = {
        paymentProviderId: "mp-12345",
        qrCode: "qr-code-data",
        qrCodeBase64: "base64-qr-code",
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockPaymentGateway.createPayment.mockResolvedValue(paymentResult);
      mockOrderRepository.update.mockResolvedValue(order);

      const result = await PaymentUseCases.createPayment(
        "order-1",
        "pix",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(result).toEqual({
        orderId: order.id,
        paymentProviderId: "mp-12345",
        qrCode: "qr-code-data",
        qrCodeBase64: "base64-qr-code",
      });

      expect(mockPaymentGateway.createPayment).toHaveBeenCalledWith({
        amount: order.totalAmount,
        description: `Pedido #${order.id}`,
        orderId: order.id,
        customerEmail: "guest@example.com",
        paymentMethodId: "pix",
      });

      expect(order.paymentProviderId).toBe("mp-12345");
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });
    it("should create payment for confirmed order with customer", async () => {
      const customerId = uuidv4();
      const order = new Order(uuidv4(), customerId);
      const productId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, order.id, itemId, "No onions"),
      ]);
      order.confirm(); // Confirm the order so it can accept payment

      const customer = {
        id: customerId,
        name: "John Doe",
        email: "john@example.com",
      };

      const paymentResult = {
        paymentProviderId: "mp-12345",
        qrCode: "qr-code-data",
        qrCodeBase64: "base64-qr-code",
      };

      const mockCustomerRepository = {
        findById: jest.fn().mockResolvedValue(customer),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByEmail: jest.fn(),
        findByCPF: jest.fn(),
        findAll: jest.fn(),
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockPaymentGateway.createPayment.mockResolvedValue(paymentResult);
      mockOrderRepository.update.mockResolvedValue(order);

      const result = await PaymentUseCases.createPayment(
        "order-1",
        "pix",
        mockOrderRepository,
        mockPaymentGateway,
        mockCustomerRepository
      );

      expect(result).toEqual({
        orderId: order.id,
        paymentProviderId: "mp-12345",
        qrCode: "qr-code-data",
        qrCodeBase64: "base64-qr-code",
      });

      expect(mockPaymentGateway.createPayment).toHaveBeenCalledWith({
        amount: order.totalAmount,
        description: `Pedido #${order.id}`,
        orderId: order.id,
        customerEmail: "john@example.com",
        paymentMethodId: "pix",
      });
    });
    it("should handle customer not found and use guest email", async () => {
      const customerId = uuidv4();
      const order = new Order(uuidv4(), customerId);
      const productId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, order.id, itemId, "No onions"),
      ]);
      order.confirm(); // Confirm the order so it can accept payment

      const paymentResult = {
        paymentProviderId: "mp-12345",
        qrCode: "qr-code-data",
        qrCodeBase64: "base64-qr-code",
      };
      const mockCustomerRepository = {
        findById: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByEmail: jest.fn(),
        findByCPF: jest.fn(),
        findAll: jest.fn(),
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockPaymentGateway.createPayment.mockResolvedValue(paymentResult);
      mockOrderRepository.update.mockResolvedValue(order);

      await PaymentUseCases.createPayment(
        "order-1",
        "pix",
        mockOrderRepository,
        mockPaymentGateway,
        mockCustomerRepository
      );

      expect(mockPaymentGateway.createPayment).toHaveBeenCalledWith({
        amount: order.totalAmount,
        description: `Pedido #${order.id}`,
        orderId: order.id,
        customerEmail: "guest@example.com",
        paymentMethodId: "pix",
      });
    });

    it("should throw error when order not found", async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        PaymentUseCases.createPayment(
          "non-existent-order",
          "pix",
          mockOrderRepository,
          mockPaymentGateway
        )
      ).rejects.toThrow("Order not found");
    });
    it("should throw error when order is not confirmed", async () => {
      const order = new Order();
      const productId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, order.id, itemId, "No onions"),
      ]);
      // Order remains in PENDING status (not confirmed)

      mockOrderRepository.findById.mockResolvedValue(order);

      await expect(
        PaymentUseCases.createPayment(
          "order-1",
          "pix",
          mockOrderRepository,
          mockPaymentGateway
        )
      ).rejects.toThrow("Order must be in CONFIRMED status to create payment");
    });
  });

  describe("handleWebhookNotification - edge cases", () => {
    it("should handle payment with no external reference", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.APPROVED,
        externalReference: undefined,
      });

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Payment payment-1 has no external reference."
      );
      expect(mockOrderRepository.findById).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle order not found", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.APPROVED,
        externalReference: "non-existent-order",
      });
      mockOrderRepository.findById.mockResolvedValue(null);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "Order not found with ID: non-existent-order"
      );
      expect(mockOrderRepository.update).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
    it("should handle pending order with approved payment", async () => {
      const order = new Order();
      const productId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, order.id, itemId, "No onions"),
      ]);
      expect(order.status).toBe(OrderStatus.PENDING);

      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.APPROVED,
        externalReference: order.id,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(order.paymentStatus).toBe(PaymentStatus.APPROVED);
      expect(order.paymentProviderId).toBe("payment-1");
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });
    it("should handle already confirmed order with approved payment", async () => {
      const order = new Order();
      const productId = uuidv4();
      const itemId = uuidv4();
      order.addItem([
        new OrderItem(productId, 2, 15.99, order.id, itemId, "No onions"),
      ]);
      order.confirm(); // Status is now CONFIRMED
      expect(order.status).toBe(OrderStatus.CONFIRMED);

      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.APPROVED,
        externalReference: order.id,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.status).toBe(OrderStatus.PAYMENT_CONFIRMED);
      expect(order.paymentStatus).toBe(PaymentStatus.APPROVED);
      expect(order.paymentProviderId).toBe("payment-1");
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });

    it("should handle rejected payment", async () => {
      const order = new Order();

      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.REJECTED,
        externalReference: order.id,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.status).toBe(OrderStatus.PENDING); // Status should remain unchanged
      expect(order.paymentStatus).toBe(PaymentStatus.REJECTED);
      expect(order.paymentProviderId).toBe("payment-1");
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });

    it("should handle cancelled payment", async () => {
      const order = new Order();

      mockPaymentGateway.getPaymentStatus.mockResolvedValue({
        status: PaymentStatus.CANCELLED,
        externalReference: order.id,
      });
      mockOrderRepository.findById.mockResolvedValue(order);

      await PaymentUseCases.handleWebhookNotification(
        "payment-1",
        mockOrderRepository,
        mockPaymentGateway
      );

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe(PaymentStatus.CANCELLED);
      expect(order.paymentProviderId).toBe("payment-1");
      expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    });
  });
});
