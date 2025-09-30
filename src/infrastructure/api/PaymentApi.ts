import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { Router } from "express";
import PaymentController from "@controllers/PaymentController";

/**
 * @openapi
 * /payments/order/{orderId}/status:
 *   get:
 *     tags: [Payments]
 *     summary: Consulta o status de pagamento de um pedido
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do pagamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentStatus:
 *                   type: string
 *       404:
 *         description: Pedido não encontrado
 */
export function setupPaymentRoutes(dbConnection: IDatabaseConnection) {
  const router = Router();

  router.get("/payments/order/:orderId/status", async (req, res) => {
    try {
      const paymentStatus = await PaymentController.getPaymentStatus(
        req.params.orderId,
        dbConnection
      );
      if (paymentStatus) {
        res.json({ paymentStatus });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
