import Order from "../../domain/entities/Order";
import Product from "../../domain/entities/Product";
import Customer from "../../domain/entities/Customer";

interface KitchenOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  observation?: string;
}

interface KitchenOrder {
  id: string;
  orderNumber?: number;
  customerName?: string;
  status: string;
  items: KitchenOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

class KitchenPresenter {
  static toJSON(
    order: Order,
    products: Map<string, Product>,
    customers: Map<string, Customer> = new Map()
  ): KitchenOrder {
    const items = order.items.map((item) => {
      const product = products.get(item.productId);
      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name || "Produto não encontrado",
        quantity: item.quantity,
        observation: item.observation,
      };
    });

    const customer = order.customerId
      ? customers.get(order.customerId)
      : undefined;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: customer?.name,
      status: order.status,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toJSONArray(
    orders: Order[],
    products: Map<string, Product>,
    customers: Map<string, Customer> = new Map()
  ): KitchenOrder[] {
    return orders.map((order) => this.toJSON(order, products, customers));
  }
}

export default KitchenPresenter;
