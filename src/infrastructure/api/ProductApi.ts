import { Router } from "express";
import { IDatabaseConnection } from "@infra-interfaces/IDbConnection";
import ProductController from "@controllers/ProductController";

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 *   post:
 *     tags: [Products]
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado
 *
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Busca um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 *   put:
 *     tags: [Products]
 *     summary: Atualiza um produto
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Produto atualizado
 *   delete:
 *     tags: [Products]
 *     summary: Remove um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Produto removido
 */
export function setupProductRoutes(dbConnection: IDatabaseConnection) {
  const router = Router();

  router.get("/products", async (req, res) => {
    try {
      const result = await ProductController.getAllProducts(dbConnection);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.get("/products/:id", async (req, res) => {
    try {
      const result = await ProductController.getProductById(
        req.params.id,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.post("/products", async (req, res) => {
    try {
      const { name, description, price, categoryId, imageUrl } = req.body;
      const result = await ProductController.createProduct(
        name,
        description,
        price,
        categoryId,
        imageUrl,
        dbConnection
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put("/products/:id", async (req, res) => {
    try {
      const { name, description, price, categoryId, imageUrl, isAvailable } =
        req.body;
      const result = await ProductController.updateProduct(
        req.params.id,
        name,
        description,
        price,
        categoryId,
        imageUrl,
        isAvailable,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete("/products/:id", async (req, res) => {
    try {
      const result = await ProductController.deleteProductById(
        req.params.id,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  });

  router.get("/category/:categoryId/products", async (req, res) => {
    try {
      const result = await ProductController.getProductsByCategory(
        req.params.categoryId,
        dbConnection
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
