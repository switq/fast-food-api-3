import Order from "../../domain/entities/Order";
import Customer from "../../domain/entities/Customer";

interface OrderConfirmationResponse {
  orderNumber: number;
  createdAt: Date;
  customerName?: string;
}

class OrderConfirmationPresenter {
  static toJSON(
    order: Order,
    customers: Map<string, Customer> = new Map()
  ): OrderConfirmationResponse {
    const customer = order.customerId
      ? customers.get(order.customerId)
      : undefined;

    return {
      orderNumber: order.orderNumber!,
      createdAt: order.createdAt,
      customerName: customer?.name,
    };
  }
}

export default OrderConfirmationPresenter;
