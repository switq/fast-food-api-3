import Order, { OrderStatus } from "../../domain/entities/Order";
import { IOrderRepository } from "../../domain/repositories/IOrderRepository";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import Product from "../../domain/entities/Product";
import Customer from "../../domain/entities/Customer";
import OrderUseCases from "./OrderUseCases";

class KitchenUseCases {
  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    switch (status) {
      case OrderStatus.PREPARING:
        if (order.status !== OrderStatus.PAYMENT_CONFIRMED) {
          throw new Error(
            "Order can only be moved to PREPARING from PAYMENT_CONFIRMED"
          );
        }
        return OrderUseCases.startPreparingOrder(id, repository);
      case OrderStatus.READY:
        if (order.status !== OrderStatus.PREPARING) {
          throw new Error("Order can only be moved to READY from PREPARING");
        }
        return OrderUseCases.markOrderAsReady(id, repository);
      default:
        throw new Error(`Invalid status transition for kitchen: ${status}`);
    }
  }

  static async updateOrderStatusWithProducts(
    id: string,
    status: OrderStatus,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    await this.updateOrderStatus(id, status, orderRepository);
    return OrderUseCases.findOrderByIdWithProducts(
      id,
      orderRepository,
      productRepository
    );
  }

  static async updateOrderStatusWithProductsAndCustomers(
    id: string,
    status: OrderStatus,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerRepository: ICustomerRepository
  ): Promise<{
    order: Order;
    products: Map<string, Product>;
    customers: Map<string, Customer>;
  }> {
    await this.updateOrderStatus(id, status, orderRepository);
    return OrderUseCases.findOrderByIdWithProductsAndCustomers(
      id,
      orderRepository,
      productRepository,
      customerRepository
    );
  }

  static async getPaymentConfirmedOrders(
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ orders: Order[]; products: Map<string, Product> }> {
    return OrderUseCases.findOrdersByStatusWithProducts(
      OrderStatus.PAYMENT_CONFIRMED,
      orderRepository,
      productRepository
    );
  }

  static async getPaymentConfirmedOrdersWithCustomers(
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerRepository: ICustomerRepository
  ): Promise<{
    orders: Order[];
    products: Map<string, Product>;
    customers: Map<string, Customer>;
  }> {
    const orders = await orderRepository.findByStatus(
      OrderStatus.PAYMENT_CONFIRMED
    );
    const products = await OrderUseCases.findOrdersByStatusWithProducts(
      OrderStatus.PAYMENT_CONFIRMED,
      orderRepository,
      productRepository
    );
    const customers = await OrderUseCases.findAllOrdersWithCustomers(
      orderRepository,
      customerRepository
    );
    return {
      orders,
      products: products.products,
      customers: customers.customers,
    };
  }
}

export default KitchenUseCases;
