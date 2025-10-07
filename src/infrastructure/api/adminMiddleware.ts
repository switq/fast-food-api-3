import { Request, Response, NextFunction } from "express";

/**
 * Middleware para rotas administrativas: exige JWT válido e claim role=admin
 * Exemplo de uso:
 *
 * router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => { ... })
 *
 * O JWT deve conter o claim: { role: "admin" }
 * O token é gerado via rota /admin-login (Lambda Auth), autenticando no Cognito User Pool de administradores.
 *
 * Se o claim não estiver presente ou for diferente de "admin", retorna 403.
 */

/**
 * Clean Architecture: Infrastructure/API Layer
 * Este middleware pertence à camada infrastructure/api e implementa a proteção de rotas administrativas.
 * Nunca deve ser referenciado por domain ou application. Use apenas na orquestração de rotas (presentation/API).
 * Reforça o padrão de separação de responsabilidades e dependência inversa.
 */
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};
