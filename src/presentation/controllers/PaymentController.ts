import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { OrderGateway } from "../gateways/OrderGateway";
import { CustomerGateway } from "../gateways/CustomerGateway";
import { MercadoPagoGateway } from "@gateways/MercadoPagoGateway";
import PaymentUseCases from "@usecases/PaymentUseCases";

class PaymentController {
  static async getPaymentStatus(
    orderId: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    return PaymentUseCases.getPaymentStatus(orderId, orderGateway);
  }

  static async handleWebhookNotification(
    paymentId: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const mercadoPagoGateway = new MercadoPagoGateway();
    await PaymentUseCases.handleWebhookNotification(
      paymentId,
      orderGateway,
      mercadoPagoGateway
    );
  }

  static async createPayment(
    orderId: string,
    paymentMethodId: string,
    dbConnection: IDatabaseConnection
  ) {
    const orderGateway = new OrderGateway(dbConnection);
    const customerGateway = new CustomerGateway(dbConnection);
    const mercadoPagoGateway = new MercadoPagoGateway();
    return PaymentUseCases.createPayment(
      orderId,
      paymentMethodId,
      orderGateway,
      mercadoPagoGateway,
      customerGateway
    );
  }
}

export default PaymentController;
