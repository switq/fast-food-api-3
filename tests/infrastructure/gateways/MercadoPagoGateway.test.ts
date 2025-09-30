import { MercadoPagoGateway } from "@gateways/MercadoPagoGateway";
import {
  PaymentCreationData,
  PaymentStatus,
} from "@app-gateways/IPaymentGateway";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import * as qrcode from "qrcode";

jest.mock("mercadopago");
jest.mock("qrcode");

describe("MercadoPagoGateway", () => {
  let gateway: MercadoPagoGateway;
  let mockPayment: jest.Mocked<Payment>;
  let mockPreference: jest.Mocked<Preference>;

  beforeEach(() => {
    const client = new MercadoPagoConfig({ accessToken: "test-token" });
    mockPayment = new Payment(client) as jest.Mocked<Payment>;
    mockPreference = new Preference(client) as jest.Mocked<Preference>;
    (Payment as jest.Mock).mockImplementation(() => mockPayment);
    (Preference as jest.Mock).mockImplementation(() => mockPreference);
    gateway = new MercadoPagoGateway();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a preference and return a QR code", async () => {
    const preferenceResponse = {
      id: "pref-123",
      init_point:
        "https://mercadopago.com/checkout/v1/redirect?pref_id=pref-123",
    };
    mockPreference.create = jest.fn().mockResolvedValue(preferenceResponse);
    (qrcode.toDataURL as jest.Mock).mockResolvedValue(
      "data:image/png;base64,qr-code-base64-string"
    );

    const data: PaymentCreationData = {
      amount: 100,
      description: "Pedido Teste",
      orderId: "order-1",
      customerEmail: "cliente@teste.com",
      paymentMethodId: "pix", // This is not used anymore, but it's part of the interface
    };
    const result = await gateway.createPayment(data);

    expect(mockPreference.create).toHaveBeenCalledWith({
      body: {
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
      },
    });
    expect(result.paymentProviderId).toBe("pref-123");
    expect(result.qrCode).toBe(preferenceResponse.init_point);
    expect(result.qrCodeBase64).toBe("qr-code-base64-string");
  });

  it("should get payment status", async () => {
    const paymentResponse = {
      id: 12345,
      status: "approved",
      external_reference: "order-1",
    };
    mockPayment.get = jest.fn().mockResolvedValue(paymentResponse);

    const result = await gateway.getPaymentStatus("12345");

    expect(mockPayment.get).toHaveBeenCalledWith({ id: "12345" });
    expect(result.status).toBe(PaymentStatus.APPROVED);
    expect(result.externalReference).toBe("order-1");
  });

  it("should handle different payment statuses", async () => {
    const scenarios = [
      { apiStatus: "pending", expectedStatus: PaymentStatus.PENDING },
      { apiStatus: "in_process", expectedStatus: PaymentStatus.PENDING },
      { apiStatus: "authorized", expectedStatus: PaymentStatus.APPROVED },
      { apiStatus: "rejected", expectedStatus: PaymentStatus.REJECTED },
      { apiStatus: "cancelled", expectedStatus: PaymentStatus.CANCELLED },
      { apiStatus: "other", expectedStatus: PaymentStatus.ERROR },
    ];

    for (const scenario of scenarios) {
      mockPayment.get = jest
        .fn()
        .mockResolvedValue({ id: 123, status: scenario.apiStatus });
      const result = await gateway.getPaymentStatus("123");
      expect(result.status).toBe(scenario.expectedStatus);
    }
  });

  it("should handle errors when getting payment status", async () => {
    mockPayment.get = jest.fn().mockRejectedValue(new Error("API Error"));
    const result = await gateway.getPaymentStatus("123");
    expect(result.status).toBe(PaymentStatus.ERROR);
  });

  it("should handle no status in payment response", async () => {
    mockPayment.get = jest.fn().mockResolvedValue({ id: 123 });
    const result = await gateway.getPaymentStatus("123");
    expect(result.status).toBe(PaymentStatus.ERROR);
  });
});
