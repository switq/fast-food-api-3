import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import { Router } from "express";
import CustomerController from "@controllers/CustomerController";

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: Lista todos os clientes
 *     responses:
 *       200:
 *         description: Lista de clientes
 *   post:
 *     tags: [Customers]
 *     summary: Cria um novo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado
 *       400:
 *         description: Erro na requisição
 *
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Busca um cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 *   put:
 *     tags: [Customers]
 *     summary: Atualiza um cliente
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado
 *       400:
 *         description: Erro na atualização
 *   delete:
 *     tags: [Customers]
 *     summary: Remove um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses: *       200:
 *         description: Cliente removido com sucesso
 *       404:
 *         description: Cliente não encontrado
 * * /customers/identify/{cpf}:
 *   get:
 *     tags: [Customers]
 *     summary: Busca um cliente pelo CPF
 *     description: Encontra um cliente específico usando o CPF para busca. Suporta CPF formatado ou apenas números.
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF do cliente (formatado 123.456.789-09 ou apenas números 12345678909)
 *         example: "123.456.789-09"
 *     responses:
 *       200:
 *         description: Cliente identificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *                 name:
 *                   type: string
 *                   example: "João Silva"
 *                 email:
 *                   type: string
 *                   example: "joao.silva@email.com"
 *                 cpf:
 *                   type: string
 *                   example: "123.456.789-09"
 *                 phone:
 *                   type: string
 *                   example: "+5511999999999"
 *       404:
 *         description: Cliente não encontrado com este CPF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Customer not found"
 *       400:
 *         description: CPF inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid CPF"
 */
export function setupCustomerRoutes(dbConnection: IDatabaseConnection) {
  const router = Router();

  router.get("/customers", async (req, res) => {
    try {
      const result = await CustomerController.getAllCustomers(dbConnection);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  }); // Endpoint para identificação do cliente por CPF - deve vir antes da rota /:id
  router.get("/customers/identify/:cpf", async (req, res) => {
    try {
      const result = await CustomerController.getCustomerByCPF(
        req.params.cpf,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.get("/customers/:id", async (req, res) => {
    try {
      const result = await CustomerController.getCustomerById(
        req.params.id,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.post("/customers", async (req, res) => {
    try {
      const { name, email, cpf, phone } = req.body;
      const result = await CustomerController.createCustomer(
        name,
        email,
        cpf,
        phone,
        dbConnection
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put("/customers/:id", async (req, res) => {
    try {
      const { name, email, cpf, phone } = req.body;
      const result = await CustomerController.updateCustomer(
        req.params.id,
        name,
        email,
        cpf,
        phone,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete("/customers/:id", async (req, res) => {
    try {
      const result = await CustomerController.deleteCustomerById(
        req.params.id,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  return router;
}
