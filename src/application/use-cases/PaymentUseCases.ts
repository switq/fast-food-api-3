import { IOrderRepository } from "@repositories/IOrderRepository";
import { ICustomerRepository } from "@repositories/ICustomerRepository";
import {
  IPaymentGateway,
  PaymentStatus,
} from "@src/application/interfaces/gateways/IPaymentGateway";

class PaymentUseCases {
  static async handleWebhookNotification(
    paymentId: string,
    orderRepository: IOrderRepository,
    paymentGateway: IPaymentGateway
  ) {
    console.log(`Processing webhook notification for payment ID: ${paymentId}`);
    console.log("--------------------");

    const paymentStatusResult =
      await paymentGateway.getPaymentStatus(paymentId);

    console.log(`Payment status result:`, {
      status: paymentStatusResult.status,
      externalReference: paymentStatusResult.externalReference,
    });

    if (!paymentStatusResult.externalReference) {
      console.error(`Payment ${paymentId} has no external reference.`);
      console.log("--------------------");
      return;
    }

    console.log(
      `Looking for order with ID: ${paymentStatusResult.externalReference}`
    );
    const order = await orderRepository.findById(
      paymentStatusResult.externalReference
    );

    if (order) {
      console.log(
        `Found order ${order.id}, updating payment status to: ${paymentStatusResult.status}`
      );

      order.setPaymentStatus(paymentStatusResult.status);
      order.setPaymentProviderId(paymentId);

      if (paymentStatusResult.status === PaymentStatus.APPROVED) {
        console.log(`Payment approved, confirming order payment`);

        // First confirm the order if it's still pending
        if (order.status === "PENDING") {
          console.log(`Order is PENDING, confirming order first`);
          order.confirm();
        }

        // Then confirm the payment
        if (order.status === "CONFIRMED") {
          console.log(`Order is CONFIRMED, confirming payment`);
          order.confirmPayment();
        }
      }

      await orderRepository.update(order);
      console.log(`Order ${order.id} updated successfully`);
    } else {
      console.error(
        `Order not found with ID: ${paymentStatusResult.externalReference}`
      );
    }

    console.log("--------------------");
  }

  static async getPaymentStatus(
    orderId: string,
    orderRepository: IOrderRepository
  ): Promise<string | null> {
    const order = await orderRepository.findById(orderId);
    return order ? order.paymentStatus : null;
  }

  static async createPayment(
    orderId: string,
    paymentMethodId: string,
    orderRepository: IOrderRepository,
    paymentGateway: IPaymentGateway,
    customerRepository?: ICustomerRepository
  ) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "CONFIRMED") {
      throw new Error("Order must be in CONFIRMED status to create payment");
    }

    let customerEmail = "guest@example.com";

    if (order.customerId && customerRepository) {
      const customer = await customerRepository.findById(order.customerId);
      if (customer) {
        customerEmail = customer.email;
      }
    }

    const paymentData = {
      amount: order.totalAmount,
      description: `Pedido #${order.id}`,
      orderId: order.id,
      customerEmail,
      paymentMethodId,
    };

    const paymentResult = await paymentGateway.createPayment(paymentData);

    // Update the order with the preference ID from Mercado Pago
    order.setPaymentProviderId(paymentResult.paymentProviderId);
    await orderRepository.update(order);

    return {
      orderId: order.id,
      paymentProviderId: paymentResult.paymentProviderId,
      qrCode: paymentResult.qrCode,
      qrCodeBase64: paymentResult.qrCodeBase64,
    };
  }
}

export default PaymentUseCases;
