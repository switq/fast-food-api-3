import Order, { OrderStatus } from "@entities/Order";
import OrderItem from "@entities/OrderItem";
import { IOrderRepository } from "@repositories/IOrderRepository";
import { IProductRepository } from "@repositories/IProductRepository";
import { ICustomerRepository } from "@repositories/ICustomerRepository";
import Product from "@entities/Product";
import Customer from "@entities/Customer";

class OrderUseCases {
  // Helper methods moved from services
  private static async getProductsFromOrders(
    orders: Order[],
    productRepository: IProductRepository
  ): Promise<Map<string, Product>> {
    // Buscar todos os produtos únicos dos pedidos
    const productIds = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productIds.add(item.productId);
      });
    });

    // Buscar informações dos produtos
    const products = new Map<string, Product>();
    for (const productId of productIds) {
      const product = await productRepository.findById(productId);
      if (product) {
        products.set(productId, product);
      }
    }

    return products;
  }

  private static async getProductsFromOrder(
    order: Order,
    productRepository: IProductRepository
  ): Promise<Map<string, Product>> {
    return this.getProductsFromOrders([order], productRepository);
  }

  private static async getCustomersFromOrders(
    orders: Order[],
    customerRepository: ICustomerRepository
  ): Promise<Map<string, Customer>> {
    const customerIds = new Set<string>();
    orders.forEach((order) => {
      if (order.customerId) {
        customerIds.add(order.customerId);
      }
    });

    const customers = new Map<string, Customer>();

    for (const customerId of customerIds) {
      try {
        const customer = await customerRepository.findById(customerId);
        if (customer) {
          customers.set(customerId, customer);
        }
      } catch (error) {
        console.warn(`Could not fetch customer ${customerId}:`, error);
      }
    }

    return customers;
  }

  private static async getCustomerFromOrder(
    order: Order,
    customerRepository: ICustomerRepository
  ): Promise<Map<string, Customer>> {
    return this.getCustomersFromOrders([order], customerRepository);
  }

  static async createOrder(
    items: OrderItem[],
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerId?: string,
    customerRepository?: ICustomerRepository
  ): Promise<Order> {
    // Se customerId for informado, valida se existe
    if (customerId && customerRepository) {
      const customer = await customerRepository.findById(customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }
    }
    // Cria o pedido já com os itens e customerId opcional
    const order = new Order(undefined, customerId);
    const createdOrder = await orderRepository.create(order);

    // Validate products for each order item and check stock
    for (const orderItem of items) {
      const product = await productRepository.findById(orderItem.productId);
      if (!product) {
        throw new Error(`Product with ID ${orderItem.productId} not found`);
      }
      if (!product.isAvailable) {
        throw new Error(`Product ${product.name} is not available`);
      }
      if (product.stock < orderItem.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
    }

    // Decrease stock for each product
    for (const orderItem of items) {
      const product = await productRepository.findById(orderItem.productId);
      if (product) {
        await productRepository.updateStock(
          product.id,
          product.stock - orderItem.quantity
        );
      }
    }

    // Add items to the order
    createdOrder.addItem(items);
    return orderRepository.update(createdOrder);
  }

  static async findOrderById(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  static async findOrdersByCustomer(
    customerId: string,
    repository: IOrderRepository
  ): Promise<Order[]> {
    return repository.findByCustomerId(customerId);
  }

  static async findAllOrders(repository: IOrderRepository): Promise<Order[]> {
    return repository.findAll();
  }

  static async findOrdersByStatus(
    status: string,
    repository: IOrderRepository
  ): Promise<Order[]> {
    return repository.findByStatus(status);
  }

  static async listSortedOrders(
    repository: IOrderRepository
  ): Promise<Order[]> {
    return repository.findAllSorted();
  }

  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // Use the appropriate status transition method from Order entity
    switch (status) {
      case OrderStatus.CONFIRMED:
        order.confirm();
        break;
      case OrderStatus.PAYMENT_CONFIRMED:
        order.confirmPayment();
        break;
      case OrderStatus.PREPARING:
        order.startPreparing();
        break;
      case OrderStatus.READY:
        order.markAsReady();
        break;
      case OrderStatus.DELIVERED:
        order.markAsDelivered();
        break;
      case OrderStatus.CANCELLED:
        order.cancel();
        break;
      default:
        throw new Error(`Invalid status transition to ${status}`);
    }

    return repository.update(order);
  }

  static async addItemsToOrder(
    id: string,
    items: OrderItem[],
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Cannot add items to an order that is not pending");
    }

    // Validate products for each order item
    for (const orderItem of items) {
      const product = await productRepository.findById(orderItem.productId);
      if (!product) {
        throw new Error(`Product with ID ${orderItem.productId} not found`);
      }
      if (!product.isAvailable) {
        throw new Error(`Product ${product.name} is not available`);
      }
    }

    order.addItem(items);
    return orderRepository.update(order);
  }

  static async updateItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.updateItemQuantity(itemId, quantity);
    return repository.update(order);
  }

  static async deleteOrder(
    id: string,
    repository: IOrderRepository
  ): Promise<void> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("Cannot delete an order that is not pending");
    }

    await repository.delete(id);
  }

  static async confirmOrder(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.confirm();
    return repository.update(order);
  }

  static async confirmPayment(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.confirmPayment();
    return repository.update(order);
  }

  static async startPreparingOrder(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.startPreparing();
    return repository.update(order);
  }

  static async markOrderAsReady(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.markAsReady();
    return repository.update(order);
  }

  static async markOrderAsDelivered(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.markAsDelivered();
    return repository.update(order);
  }

  static async cancelOrder(
    id: string,
    repository: IOrderRepository
  ): Promise<Order> {
    const order = await repository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    order.cancel();
    return repository.update(order);
  }

  // Enhanced methods that include product information
  static async findOrderByIdWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.findOrderById(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async findOrdersByCustomerWithProducts(
    customerId: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ orders: Order[]; products: Map<string, Product> }> {
    const orders = await orderRepository.findByCustomerId(customerId);
    const products = await this.getProductsFromOrders(
      orders,
      productRepository
    );
    return { orders, products };
  }

  static async findAllOrdersWithProducts(
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ orders: Order[]; products: Map<string, Product> }> {
    const orders = await orderRepository.findAll();
    const products = await this.getProductsFromOrders(
      orders,
      productRepository
    );
    return { orders, products };
  }

  static async findOrdersByStatusWithProducts(
    status: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ orders: Order[]; products: Map<string, Product> }> {
    const orders = await orderRepository.findByStatus(status);
    const products = await this.getProductsFromOrders(
      orders,
      productRepository
    );
    return { orders, products };
  }

  static async listSortedOrdersWithProducts(
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ orders: Order[]; products: Map<string, Product> }> {
    const orders = await orderRepository.findAllSorted();
    const products = await this.getProductsFromOrders(
      orders,
      productRepository
    );
    return { orders, products };
  }

  // Enhanced methods for status updates that return orders with product information
  static async updateOrderStatusWithProducts(
    id: string,
    status: OrderStatus,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.updateOrderStatus(id, status, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async addItemsToOrderWithProducts(
    id: string,
    items: OrderItem[],
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.addItemsToOrder(
      id,
      items,
      orderRepository,
      productRepository
    );
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async updateItemQuantityWithProducts(
    orderId: string,
    itemId: string,
    quantity: number,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.updateItemQuantity(
      orderId,
      itemId,
      quantity,
      orderRepository
    );
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async confirmOrderWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.confirmOrder(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async confirmPaymentWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.confirmPayment(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async startPreparingOrderWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.startPreparingOrder(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async markOrderAsReadyWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.markOrderAsReady(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async markOrderAsDeliveredWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.markOrderAsDelivered(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  static async cancelOrderWithProducts(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository
  ): Promise<{ order: Order; products: Map<string, Product> }> {
    const order = await this.cancelOrder(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    return { order, products };
  }

  // Enhanced methods that include customer information
  static async findOrderByIdWithCustomers(
    id: string,
    orderRepository: IOrderRepository,
    customerRepository: ICustomerRepository
  ): Promise<{ order: Order; customers: Map<string, Customer> }> {
    const order = await this.findOrderById(id, orderRepository);
    const customers = await this.getCustomerFromOrder(
      order,
      customerRepository
    );
    return { order, customers };
  }

  static async findOrdersByCustomerWithCustomers(
    customerId: string,
    orderRepository: IOrderRepository,
    customerRepository: ICustomerRepository
  ): Promise<{ orders: Order[]; customers: Map<string, Customer> }> {
    const orders = await orderRepository.findByCustomerId(customerId);
    const customers = await this.getCustomersFromOrders(
      orders,
      customerRepository
    );
    return { orders, customers };
  }

  static async findAllOrdersWithCustomers(
    orderRepository: IOrderRepository,
    customerRepository: ICustomerRepository
  ): Promise<{ orders: Order[]; customers: Map<string, Customer> }> {
    const orders = await orderRepository.findAll();
    const customers = await this.getCustomersFromOrders(
      orders,
      customerRepository
    );
    return { orders, customers };
  }

  // Enhanced methods that include both product and customer information
  static async findOrderByIdWithProductsAndCustomers(
    id: string,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerRepository: ICustomerRepository
  ): Promise<{
    order: Order;
    products: Map<string, Product>;
    customers: Map<string, Customer>;
  }> {
    const order = await this.findOrderById(id, orderRepository);
    const products = await this.getProductsFromOrder(order, productRepository);
    const customers = await this.getCustomerFromOrder(
      order,
      customerRepository
    );
    return { order, products, customers };
  }

  static async findAllOrdersWithProductsAndCustomers(
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerRepository: ICustomerRepository
  ): Promise<{
    orders: Order[];
    products: Map<string, Product>;
    customers: Map<string, Customer>;
  }> {
    const orders = await orderRepository.findAll();
    const products = await this.getProductsFromOrders(
      orders,
      productRepository
    );
    const customers = await this.getCustomersFromOrders(
      orders,
      customerRepository
    );
    return { orders, products, customers };
  }
}

export default OrderUseCases;
