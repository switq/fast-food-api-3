import { Router } from "express";
import PaymentController from "../../presentation/controllers/PaymentController";
import { IDatabaseConnection } from "../interfaces/IDbConnection";

/**
 * @openapi
 * /webhooks/paymentwebhook:
 *   post:
 *     tags: [Webhooks]
 *     summary: Webhook dedicado para notificações de pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Notificação recebida com sucesso
 */
export function setupPaymentWebhookRoute(dbConnection: IDatabaseConnection) {
  const router = Router();

  router.post("/webhooks/paymentwebhook", async (req, res) => {
    try {
      const paymentId = req.body.data?.id;
      if (paymentId) {
        await PaymentController.handleWebhookNotification(
          paymentId,
          dbConnection
        );
      }
      res.status(200).send("ok");
    } catch (err) {
      // Sempre retorna 200 para evitar retries do sistema de pagamento
      console.error("[Webhook] Error handling payment webhook:", err);
      res.status(200).send("ok");
    }
  });

  return router;
}
