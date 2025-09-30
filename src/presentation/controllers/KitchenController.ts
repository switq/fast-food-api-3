import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { OrderGateway } from "../gateways/OrderGateway";
import { ProductGateway } from "../gateways/ProductGateway";
import { CustomerGateway } from "../gateways/CustomerGateway";
import KitchenUseCases from "../../application/use-cases/KitchenUseCases";
import EnhancedOrderPresenter from "../presenters/EnhancedOrderPresenter";
import KitchenPresenter from "../presenters/KitchenPresenter";
import { OrderStatus } from "../../domain/entities/Order";

class KitchenController {
  static async updateOrderStatus(
    id: string,
    status: OrderStatus,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { order, products, customers } =
      await KitchenUseCases.updateOrderStatusWithProductsAndCustomers(
        id,
        status,
        orderGateway,
        productGateway,
        customerGateway
      );
    return EnhancedOrderPresenter.toJSON(order, products, customers);
  }

  static async getPaymentConfirmedOrders(dbConnection: IDatabaseConnection) {
    const orderGateway = new OrderGateway(dbConnection);
    const productGateway = new ProductGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const { orders, products, customers } =
      await KitchenUseCases.getPaymentConfirmedOrdersWithCustomers(
        orderGateway,
        productGateway,
        customerGateway
      );
    return KitchenPresenter.toJSONArray(orders, products, customers);
  }
}

export default KitchenController;
