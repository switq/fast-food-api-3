import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { Router } from "express";
import KitchenController from "@controllers/KitchenController";
import OrderController from "@controllers/OrderController";

/**
 * @openapi
 * /api/kitchen/orders:
 *   get:
 *     tags: [Kitchen]
 *     summary: Lista todos os pedidos para a cozinha ordenados por prioridade
 *     description: Retorna pedidos ordenados por prioridade (READY > PREPARING > PAYMENT_CONFIRMED) e por data de criação (mais antigos primeiro). Exclui pedidos finalizados (DELIVERED).
 *     responses:
 *       200:
 *         description: Lista de pedidos ordenados para a cozinha
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   orderNumber:
 *                     type: number
 *                   customerName:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [READY, PREPARING, PAYMENT_CONFIRMED]
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         productId:
 *                           type: string
 *                         productName:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         observation:
 *                           type: string
 *                   totalAmount:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Erro ao buscar pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string * /api/kitchen/orders/awaiting-preparation:
 *   get:
 *     tags: [Kitchen]
 *     summary: Lista pedidos aguardando preparo
 *     description: Retorna apenas pedidos com status PAYMENT_CONFIRMED que estão aguardando o início do preparo na cozinha.
 *     responses:
 *       200:
 *         description: Lista de pedidos aguardando preparo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   orderNumber:
 *                     type: number
 *                   customerName:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [PAYMENT_CONFIRMED]
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         productId:
 *                           type: string
 *                         productName:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         observation:
 *                           type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Erro ao buscar pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lista de pedidos com status PAYMENT_CONFIRMED
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   orderNumber:
 *                     type: number
 *                   status:
 *                     type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         productId:
 *                           type: string
 *                         productName:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         observation:
 *                           type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Erro ao buscar pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * /api/kitchen/orders/{id}/status:
 *   patch:
 *     tags: [Kitchen]
 *     summary: Atualiza o status de um pedido (cozinha)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PREPARING, READY]
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Erro na atualização do status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *     x-business-logic:
 *       - only allow status transition from PREPARING to READY
 *       - order must be in PREPARING status to be marked as READY
 *       - respond with 400 Bad Request if business rules are violated
 */
export function setupKitchenRoutes(dbConnection: IDatabaseConnection) {
  const router = Router();

  // Nova rota principal da cozinha - lista pedidos ordenados
  router.get("/kitchen/orders", async (req, res) => {
    try {
      const result = await OrderController.listSortedOrders(dbConnection);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }); // Rota específica - pedidos aguardando preparo
  router.get("/kitchen/orders/awaiting-preparation", async (req, res) => {
    try {
      const result =
        await KitchenController.getPaymentConfirmedOrders(dbConnection);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.patch("/kitchen/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const result = await KitchenController.updateOrderStatus(
        req.params.id,
        status,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
