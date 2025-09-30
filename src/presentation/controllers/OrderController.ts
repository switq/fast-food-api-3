import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { OrderGateway } from "../gateways/OrderGateway";
import { ProductGateway } from "../gateways/ProductGateway";
import OrderConfirmationUseCases from "../../application/use-cases/OrderConfirmationUseCases";
import OrderConfirmationPresenter from "../presenters/OrderConfirmationPresenter";
import { CustomerGateway } from "../gateways/CustomerGateway";
import OrderUseCases from "@usecases/OrderUseCases";
import EnhancedOrderPresenter from "@presenters/EnhancedOrderPresenter";
import OrderItem from "@entities/OrderItem";
import { OrderStatus } from "@entities/Order";

class OrderController {
  static async createOrder(
    items: OrderItem[],
    dbConnection: IDatabaseConnection,
    customerId?: string
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const order = await OrderUseCases.createOrder(
      items,
      orderGateway,
      productGateway,
      customerId,
      customerGateway
    );
    // Get product and customer information for the created order
    const {
      order: orderWithProducts,
      products,
      customers,
    } = await OrderUseCases.findOrderByIdWithProductsAndCustomers(
      order.id,
      orderGateway,
      productGateway,
      customerGateway
    );
    return EnhancedOrderPresenter.toJSON(
      orderWithProducts,
      products,
      customers
    );
  }

  static async getOrderById(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { order, products, customers } =
      await OrderUseCases.findOrderByIdWithProductsAndCustomers(
        id,
        orderGateway,
        productGateway,
        customerGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products, customers);
  }

  static async getOrdersByCustomer(
    customerId: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { orders, products } =
      await OrderUseCases.findOrdersByCustomerWithProducts(
        customerId,
        orderGateway,
        productGateway
      );
    const { customers } = await OrderUseCases.findOrdersByCustomerWithCustomers(
      customerId,
      orderGateway,
      customerGateway
    );
    return EnhancedOrderPresenter.toJSONArray(orders, products, customers);
  }

  static async getAllOrders(dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { orders, products, customers } =
      await OrderUseCases.findAllOrdersWithProductsAndCustomers(
        orderGateway,
        productGateway,
        customerGateway
      );
    return EnhancedOrderPresenter.toJSONArray(orders, products, customers);
  }

  static async getOrdersByStatus(
    status: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { orders, products } =
      await OrderUseCases.findOrdersByStatusWithProducts(
        status,
        orderGateway,
        productGateway
      );
    const { customers } = await OrderUseCases.findAllOrdersWithCustomers(
      orderGateway,
      customerGateway
    );
    return EnhancedOrderPresenter.toJSONArray(orders, products, customers);
  }

  static async listSortedOrders(dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { orders, products, customers } =
      await OrderUseCases.findAllOrdersWithProductsAndCustomers(
        orderGateway,
        productGateway,
        customerGateway
      );
    return EnhancedOrderPresenter.toJSONArray(orders, products, customers);
  }

  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { order, products } =
      await OrderUseCases.updateOrderStatusWithProducts(
        id,
        status,
        orderGateway,
        productGateway
      );
    const { customers } = await OrderUseCases.findOrderByIdWithCustomers(
      order.id,
      orderGateway,
      customerGateway
    );
    return EnhancedOrderPresenter.toJSON(order, products, customers);
  }

  static async addItemsToOrder(
    id: string,
    items: OrderItem[],
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { order, products } = await OrderUseCases.addItemsToOrderWithProducts(
      id,
      items,
      orderGateway,
      productGateway
    );
    const { customers } = await OrderUseCases.findOrderByIdWithCustomers(
      order.id,
      orderGateway,
      customerGateway
    );
    return EnhancedOrderPresenter.toJSON(order, products, customers);
  }

  static async updateItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } =
      await OrderUseCases.updateItemQuantityWithProducts(
        orderId,
        itemId,
        quantity,
        orderGateway,
        productGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products);
  }

  static async deleteOrderById(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    await OrderUseCases.deleteOrder(id, orderGateway);
    return { message: "Order deleted successfully" };
  }

  static async confirmOrder(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);

    const { order, customer } =
      await OrderConfirmationUseCases.confirmOrderSimple(
        id,
        orderGateway,
        customerGateway
      );

    const customers = new Map();
    if (customer) {
      customers.set(customer.id, customer);
    }

    return OrderConfirmationPresenter.toJSON(order, customers);
  }

  static async confirmPayment(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } = await OrderUseCases.confirmPaymentWithProducts(
      id,
      orderGateway,
      productGateway
    );
    return EnhancedOrderPresenter.toJSON(order, products);
  }

  static async startPreparingOrder(
    id: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } =
      await OrderUseCases.startPreparingOrderWithProducts(
        id,
        orderGateway,
        productGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products);
  }

  static async markOrderAsReady(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } =
      await OrderUseCases.markOrderAsReadyWithProducts(
        id,
        orderGateway,
        productGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products);
  }

  static async markOrderAsDelivered(
    id: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } =
      await OrderUseCases.markOrderAsDeliveredWithProducts(
        id,
        orderGateway,
        productGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products);
  }

  static async cancelOrder(id: string, dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const { order, products } = await OrderUseCases.cancelOrderWithProducts(
      id,
      orderGateway,
      productGateway
    );
    return EnhancedOrderPresenter.toJSON(order, products);
  }
}

export default OrderController;
