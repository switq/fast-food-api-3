import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import {
  IPaymentGateway,
  PaymentCreationData,
  PaymentCreationResult,
  PaymentStatus,
  PaymentStatusResult,
} from "@src/application/interfaces/gateways/IPaymentGateway";
import * as qrcode from "qrcode";

export class MercadoPagoGateway implements IPaymentGateway {
  private readonly client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
    });
  }
  async createPayment(
    data: PaymentCreationData
  ): Promise<PaymentCreationResult> {
    const preference = new Preference(this.client);

    const body = {
      items: [
        {
          id: data.orderId,
          title: data.description,
          quantity: 1,
          unit_price: data.amount,
        },
      ],
      payer: {
        email: data.customerEmail,
      },
      notification_url: process.env.MERCADO_PAGO_NOTIFICATION_URL,
      external_reference: data.orderId,
    };

    const response = await preference.create({ body });

    const qrCode = await qrcode.toDataURL(response.init_point!);

    const result: PaymentCreationResult = {
      paymentProviderId: response.id!.toString(),
      qrCode: response.init_point!,
      qrCodeBase64: qrCode.split("base64,")[1],
    };

    return result;
  }
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
    const payment = new Payment(this.client);
    try {
      console.log(`Getting payment status for payment ID: ${paymentId}`);
      const response = await payment.get({ id: paymentId });

      console.log(`Payment response:`, {
        id: response.id,
        status: response.status,
        external_reference: response.external_reference,
        status_detail: response.status_detail,
      });

      let status: PaymentStatus;
      if (!response.status) {
        status = PaymentStatus.ERROR;
      } else {
        switch (response.status) {
          case "pending":
          case "in_process":
            status = PaymentStatus.PENDING;
            break;
          case "approved":
          case "authorized":
            status = PaymentStatus.APPROVED;
            break;
          case "rejected":
            status = PaymentStatus.REJECTED;
            break;
          case "cancelled":
            status = PaymentStatus.CANCELLED;
            break;
          default:
            status = PaymentStatus.ERROR;
        }
      }

      return {
        status,
        externalReference: response.external_reference || undefined,
      };
    } catch (error) {
      console.error("Error getting payment status from Mercado Pago:", error);
      console.error("Error details:", error);
      return {
        status: PaymentStatus.ERROR,
        externalReference: undefined,
      };
    }
  }
}
