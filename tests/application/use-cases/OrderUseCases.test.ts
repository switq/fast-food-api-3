import OrderUseCases from "../../../src/application/use-cases/OrderUseCases";
import Order from "../../../src/domain/entities/Order";
import Product from "../../../src/domain/entities/Product";
import Customer from "../../../src/domain/entities/Customer";
import { IOrderRepository } from "../../../src/domain/repositories/IOrderRepository";
import { IProductRepository } from "../../../src/domain/repositories/IProductRepository";
import { ICustomerRepository } from "../../../src/domain/repositories/ICustomerRepository";
import OrderItem from "../../../src/domain/entities/OrderItem";
import Category from "../../../src/domain/entities/Category";
import { v4 as uuidv4 } from "uuid";

describe("OrderUseCases - Product and Customer Info Methods", () => {
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockCustomerRepository: jest.Mocked<ICustomerRepository>;
  let testProduct1: Product;
  let testProduct2: Product;
  let testCustomer: Customer;
  let testOrder: Order;

  beforeEach(() => {
    mockOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findAllSorted: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockProductRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByCategory: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateStock: jest.fn(),
    };

    mockCustomerRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByCPF: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const categoryId = uuidv4();
    const category = new Category(categoryId, "Burgers", "Burger category");

    testProduct1 = new Product(
      uuidv4(),
      "Burger",
      "Delicious burger",
      15.99,
      category.id,
      "https://example.com/image1.jpg",
      true
    );
    testProduct2 = new Product(
      uuidv4(),
      "Fries",
      "Crispy fries",
      5.99,
      category.id,
      "https://example.com/image2.jpg",
      true
    );

    testCustomer = new Customer(
      uuidv4(),
      "John Doe",
      "john.doe@example.com",
      "11144477735",
      "11999999999"
    );

    const orderId = uuidv4();
    const orderItem1 = new OrderItem(
      testProduct1.id,
      2,
      15.99,
      orderId,
      uuidv4(),
      "No onions"
    );
    const orderItem2 = new OrderItem(
      testProduct2.id,
      1,
      5.99,
      orderId,
      uuidv4(),
      "Extra salt"
    );

    testOrder = new Order(orderId, testCustomer.id);
    testOrder.addItem(orderItem1);
    testOrder.addItem(orderItem2);
  });

  describe("findOrderByIdWithProducts", () => {
    it("should return order with products", async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(testOrder);
      mockProductRepository.findById
        .mockResolvedValueOnce(testProduct1)
        .mockResolvedValueOnce(testProduct2);

      // Act
      const result = await OrderUseCases.findOrderByIdWithProducts(
        testOrder.id,
        mockOrderRepository,
        mockProductRepository
      );

      // Assert
      expect(result.order).toEqual(testOrder);
      expect(result.products.size).toBe(2);
      expect(result.products.get(testProduct1.id)).toEqual(testProduct1);
      expect(result.products.get(testProduct2.id)).toEqual(testProduct2);
      expect(mockProductRepository.findById).toHaveBeenCalledTimes(2);
    });

    it("should handle product not found in repository", async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(testOrder);
      mockProductRepository.findById
        .mockResolvedValueOnce(testProduct1)
        .mockResolvedValueOnce(null); // second product not found

      // Act
      const result = await OrderUseCases.findOrderByIdWithProducts(
        testOrder.id,
        mockOrderRepository,
        mockProductRepository
      );

      // Assert
      expect(result.order).toEqual(testOrder);
      expect(result.products.size).toBe(1);
      expect(result.products.get(testProduct1.id)).toEqual(testProduct1);
      expect(result.products.get(testProduct2.id)).toBeUndefined();
    });
  });

  describe("findOrderByIdWithCustomers", () => {
    it("should return order with customers", async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(testOrder);
      mockCustomerRepository.findById.mockResolvedValue(testCustomer);

      // Act
      const result = await OrderUseCases.findOrderByIdWithCustomers(
        testOrder.id,
        mockOrderRepository,
        mockCustomerRepository
      );

      // Assert
      expect(result.order).toEqual(testOrder);
      expect(result.customers.size).toBe(1);
      expect(result.customers.get(testCustomer.id)).toEqual(testCustomer);
    });

    it("should handle customer not found", async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(testOrder);
      mockCustomerRepository.findById.mockResolvedValue(null);

      // Act
      const result = await OrderUseCases.findOrderByIdWithCustomers(
        testOrder.id,
        mockOrderRepository,
        mockCustomerRepository
      );

      // Assert
      expect(result.order).toEqual(testOrder);
      expect(result.customers.size).toBe(0);
    });
  });

  describe("findOrderByIdWithProductsAndCustomers", () => {
    it("should return order with both products and customers", async () => {
      // Arrange
      mockOrderRepository.findById.mockResolvedValue(testOrder);
      mockProductRepository.findById
        .mockResolvedValueOnce(testProduct1)
        .mockResolvedValueOnce(testProduct2);
      mockCustomerRepository.findById.mockResolvedValue(testCustomer);

      // Act
      const result = await OrderUseCases.findOrderByIdWithProductsAndCustomers(
        testOrder.id,
        mockOrderRepository,
        mockProductRepository,
        mockCustomerRepository
      );

      // Assert
      expect(result.order).toEqual(testOrder);
      expect(result.products.size).toBe(2);
      expect(result.customers.size).toBe(1);
      expect(result.products.get(testProduct1.id)).toEqual(testProduct1);
      expect(result.customers.get(testCustomer.id)).toEqual(testCustomer);
    });
  });

  describe("findAllOrdersWithProductsAndCustomers", () => {
    it("should return all orders with products and customers", async () => {
      // Arrange
      const orders = [testOrder];
      mockOrderRepository.findAll.mockResolvedValue(orders);
      mockProductRepository.findById
        .mockResolvedValueOnce(testProduct1)
        .mockResolvedValueOnce(testProduct2);
      mockCustomerRepository.findById.mockResolvedValue(testCustomer);

      // Act
      const result = await OrderUseCases.findAllOrdersWithProductsAndCustomers(
        mockOrderRepository,
        mockProductRepository,
        mockCustomerRepository
      );

      // Assert
      expect(result.orders).toEqual(orders);
      expect(result.products.size).toBe(2);
      expect(result.customers.size).toBe(1);
    });

    it("should handle empty orders array", async () => {
      // Arrange
      mockOrderRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await OrderUseCases.findAllOrdersWithProductsAndCustomers(
        mockOrderRepository,
        mockProductRepository,
        mockCustomerRepository
      );

      // Assert
      expect(result.orders).toEqual([]);
      expect(result.products.size).toBe(0);
      expect(result.customers.size).toBe(0);
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(mockCustomerRepository.findById).not.toHaveBeenCalled();
    });
  });
});
