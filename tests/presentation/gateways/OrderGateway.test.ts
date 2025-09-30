import { OrderGateway } from "../../../src/presentation/gateways/OrderGateway";
import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import Order, { OrderStatus } from "../../../src/domain/entities/Order";
import { v4 as uuidv4 } from "uuid";

describe("OrderGateway", () => {
  let dbConnection: IDatabaseConnection;
  let orderGateway: OrderGateway;
  beforeEach(() => {
    dbConnection = {
      findAll: jest.fn(),
      findByField: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    orderGateway = new OrderGateway(dbConnection);
  });

  describe("findAllSorted", () => {
    it("should return orders sorted by status and creation date", async () => {
      const orders = [
        new Order(
          "550e8400-e29b-41d4-a716-446655440001",
          "550e8400-e29b-41d4-a716-446655440011",
          [],
          OrderStatus.DELIVERED
        ),
        new Order(
          "550e8400-e29b-41d4-a716-446655440002",
          "550e8400-e29b-41d4-a716-446655440012",
          [],
          OrderStatus.PREPARING,
          "approved"
        ),
        new Order(
          "550e8400-e29b-41d4-a716-446655440003",
          "550e8400-e29b-41d4-a716-446655440013",
          [],
          OrderStatus.READY,
          "approved"
        ),
        new Order(
          "550e8400-e29b-41d4-a716-446655440004",
          "550e8400-e29b-41d4-a716-446655440014",
          [],
          OrderStatus.PAYMENT_CONFIRMED,
          "approved"
        ),
        new Order(
          "550e8400-e29b-41d4-a716-446655440005",
          "550e8400-e29b-41d4-a716-446655440015",
          [],
          OrderStatus.PREPARING,
          "approved"
        ),
      ];
      (dbConnection.findAll as jest.Mock).mockResolvedValue(
        orders.map((o) => ({ ...o.toJSON(), paymentStatus: o.paymentStatus }))
      );
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const sortedOrders = await orderGateway.findAllSorted();

      expect(sortedOrders.map((o) => o.id)).toEqual([
        "550e8400-e29b-41d4-a716-446655440003",
        "550e8400-e29b-41d4-a716-446655440002",
        "550e8400-e29b-41d4-a716-446655440005",
        "550e8400-e29b-41d4-a716-446655440004",
      ]);
      expect(dbConnection.findAll).toHaveBeenCalledWith("order");
    });

    it("should handle empty orders list", async () => {
      (dbConnection.findAll as jest.Mock).mockResolvedValue([]);

      const sortedOrders = await orderGateway.findAllSorted();

      expect(sortedOrders).toEqual([]);
    });
    it("should filter out delivered orders", async () => {
      const orders = [
        new Order(uuidv4(), uuidv4(), [], OrderStatus.DELIVERED),
        new Order(uuidv4(), uuidv4(), [], OrderStatus.CANCELLED),
        new Order(uuidv4(), uuidv4(), [], OrderStatus.PENDING),
      ];

      (dbConnection.findAll as jest.Mock).mockResolvedValue(
        orders.map((o) => ({ ...o.toJSON(), paymentStatus: o.paymentStatus }))
      );
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const sortedOrders = await orderGateway.findAllSorted();

      expect(sortedOrders).toEqual([]); // All orders should be filtered out
    });
  });
  describe("create", () => {
    it("should create order with items", async () => {
      const customerId = uuidv4();
      const order = new Order(uuidv4(), customerId);
      const orderData = order.toJSON();
      const orderId = uuidv4();
      const mockCreatedOrder = { ...orderData, id: orderId };

      (dbConnection.create as jest.Mock)
        .mockResolvedValueOnce(mockCreatedOrder)
        .mockResolvedValue({ id: uuidv4() }); // For order items
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const result = await orderGateway.create(order);

      expect(result).toBeInstanceOf(Order);
      expect(result.id).toBe(orderId);
      expect(dbConnection.create).toHaveBeenCalledWith(
        "order",
        expect.any(Object)
      );
    });
  });

  describe("update", () => {
    it("should update order and recreate items", async () => {
      // Create order with specific id using constructor
      const orderId = uuidv4();
      const customerId = uuidv4();
      const orderWithId = new Order(orderId, customerId);
      const orderData = orderWithId.toJSON();
      const mockUpdatedOrder = { ...orderData, id: orderId };

      (dbConnection.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);
      (dbConnection.delete as jest.Mock).mockResolvedValue(true);
      (dbConnection.create as jest.Mock).mockResolvedValue({ id: uuidv4() });

      const result = await orderGateway.update(orderWithId);

      expect(result).toBeInstanceOf(Order);
      expect(result.id).toBe(orderId);
      expect(dbConnection.update).toHaveBeenCalledWith(
        "order",
        orderId,
        expect.any(Object)
      );
    });
    it("should handle order with orderNumber", async () => {
      const orderId = uuidv4();
      const customerId = uuidv4();
      const orderWithId = new Order(orderId, customerId);
      (orderWithId as any)._orderNumber = 123;

      const orderData = orderWithId.toJSON();
      const mockUpdatedOrder = {
        ...orderData,
        id: orderId,
        orderNumber: 123,
      };

      (dbConnection.update as jest.Mock).mockResolvedValue(mockUpdatedOrder);
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);
      (dbConnection.delete as jest.Mock).mockResolvedValue(true);

      const result = await orderGateway.update(orderWithId);

      expect((result as any)._orderNumber).toBe(123);
    });
  });
  describe("findById", () => {
    it("should find order by id", async () => {
      const orderId = uuidv4();
      const customerId = uuidv4();
      const mockOrder = {
        id: orderId,
        customerId: customerId,
        status: OrderStatus.PENDING,
        paymentStatus: "pending",
        totalAmount: 25.98,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (dbConnection.findById as jest.Mock).mockResolvedValue(mockOrder);
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const result = await orderGateway.findById(orderId);

      expect(result).toBeInstanceOf(Order);
      expect(result!.id).toBe(orderId);
      expect(dbConnection.findById).toHaveBeenCalledWith("order", orderId);
    });

    it("should return null when order not found", async () => {
      const nonExistentId = uuidv4();
      (dbConnection.findById as jest.Mock).mockResolvedValue(null);

      const result = await orderGateway.findById(nonExistentId);

      expect(result).toBe(null);
    });

    it("should handle order with orderNumber", async () => {
      const orderId = uuidv4();
      const customerId = uuidv4();
      const mockOrder = {
        id: orderId,
        customerId: customerId,
        status: OrderStatus.PENDING,
        paymentStatus: "pending",
        totalAmount: 25.98,
        orderNumber: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (dbConnection.findById as jest.Mock).mockResolvedValue(mockOrder);
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const result = await orderGateway.findById(orderId);

      expect((result as any)._orderNumber).toBe(123);
    });
  });
  describe("findAll", () => {
    it("should find all orders", async () => {
      const mockOrders = [
        {
          id: uuidv4(),
          customerId: uuidv4(),
          status: OrderStatus.PENDING,
          paymentStatus: "pending",
          totalAmount: 25.98,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          customerId: uuidv4(),
          status: OrderStatus.CONFIRMED,
          paymentStatus: "approved",
          totalAmount: 35.97,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (dbConnection.findAll as jest.Mock).mockResolvedValue(mockOrders);
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);

      const result = await orderGateway.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Order);
      expect(result[1]).toBeInstanceOf(Order);
      expect(dbConnection.findAll).toHaveBeenCalledWith("order");
    });

    it("should handle empty result", async () => {
      (dbConnection.findAll as jest.Mock).mockResolvedValue([]);

      const result = await orderGateway.findAll();

      expect(result).toEqual([]);
    });
  });
  describe("findByCustomerId", () => {
    it("should find orders by customer id", async () => {
      const customerId = uuidv4();
      const mockOrders = [
        {
          id: uuidv4(),
          customerId: customerId,
          status: OrderStatus.PENDING,
          paymentStatus: "pending",
          totalAmount: 25.98,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      (dbConnection.findByField as jest.Mock)
        .mockResolvedValueOnce(mockOrders)
        .mockResolvedValue([]); // For order items

      const result = await orderGateway.findByCustomerId(customerId);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Order);
      expect(result[0].customerId).toBe(customerId);
      expect(dbConnection.findByField).toHaveBeenCalledWith(
        "order",
        "customerId",
        customerId
      );
    });
  });
  describe("findByStatus", () => {
    it("should find orders by status", async () => {
      const mockOrders = [
        {
          id: uuidv4(),
          customerId: uuidv4(),
          status: OrderStatus.PREPARING,
          paymentStatus: "approved",
          totalAmount: 25.98,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (dbConnection.findByField as jest.Mock)
        .mockResolvedValueOnce(mockOrders)
        .mockResolvedValue([]); // For order items

      const result = await orderGateway.findByStatus("PREPARING");

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Order);
      expect(result[0].status).toBe(OrderStatus.PREPARING);
      expect(dbConnection.findByField).toHaveBeenCalledWith(
        "order",
        "status",
        "PREPARING"
      );
    });
  });
  describe("delete", () => {
    it("should delete order and its items", async () => {
      const orderId = uuidv4();
      const itemId = uuidv4();
      const productId = uuidv4();
      const mockItems = [
        {
          id: itemId,
          orderId: orderId,
          productId: productId,
          quantity: 2,
          unitPrice: 15.99,
        },
      ];

      (dbConnection.findByField as jest.Mock).mockResolvedValue(mockItems);
      (dbConnection.delete as jest.Mock).mockResolvedValue(true);
      await orderGateway.delete(orderId);

      expect(dbConnection.delete).toHaveBeenCalledWith("orderItem", itemId);
      expect(dbConnection.delete).toHaveBeenCalledWith("order", orderId);
    });
    it("should throw error when order not found", async () => {
      const nonExistentId = uuidv4();
      (dbConnection.findByField as jest.Mock).mockResolvedValue([]);
      (dbConnection.delete as jest.Mock).mockResolvedValue(false);

      await expect(orderGateway.delete(nonExistentId)).rejects.toThrow(
        `Order with ID ${nonExistentId} not found`
      );
    });
  });
  describe("getOrderItems", () => {
    it("should get order items and create OrderItem instances", async () => {
      const orderId = uuidv4();
      const itemId = uuidv4();
      const productId = uuidv4();
      const mockItems = [
        {
          id: itemId,
          orderId: orderId,
          productId: productId,
          quantity: 2,
          unitPrice: 15.99,
          totalPrice: 31.98,
          observation: "No onions",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (dbConnection.findByField as jest.Mock).mockResolvedValue(mockItems); // Access private method via reflection for testing
      const getOrderItems = (orderGateway as any).getOrderItems.bind(
        orderGateway
      );
      const result = await getOrderItems(orderId);

      expect(result).toHaveLength(1);
      expect(result[0].productId).toBe(productId);
      expect(result[0].quantity).toBe(2);
      expect(result[0].observation).toBe("No onions");
    });
  });
});
