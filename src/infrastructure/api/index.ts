import "dotenv/config";
import { setupCategoryRoutes } from "./CategoryApi";
import { setupProductRoutes } from "./ProductApi";
import { setupCustomerRoutes } from "./CustomerApi";
import { setupOrderRoutes } from "./OrderApi";
import { setupKitchenRoutes } from "./KitchenApi";
import { setupPaymentRoutes } from "./PaymentApi";
import express from "express";
// import swaggerUi from "swagger-ui-express";
// import swaggerJsdoc from "swagger-jsdoc";
import { IDatabaseConnection } from "../interfaces/IDbConnection";
import { setupPaymentWebhookRoute } from "./PaymentWebhookApi";

export class FastFoodApp {
  start(dbConnection: IDatabaseConnection) {
    const app = express();
    app.use(express.json());
    const port = process.env.PORT ?? 3000; // Swagger setup - TEMPORARILY DISABLED DUE TO ERROR
    // const swaggerOptions = {
    //   definition: {
    //     openapi: "3.0.0",
    //     info: {
    //       title: "Fast Food API",
    //       version: "1.0.0",
    //     },
    //   },
    //   apis: [
    //     "src/infrastructure/api/*.ts",
    //     "src/presentation/controllers/*.ts",
    //   ],
    // };
    // const swaggerSpec = swaggerJsdoc(swaggerOptions);
    // app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Mount routers
    app.use("/api", setupCategoryRoutes(dbConnection));
    app.use("/api", setupProductRoutes(dbConnection));
    app.use("/api", setupCustomerRoutes(dbConnection));
    app.use("/api", setupOrderRoutes(dbConnection));
    app.use("/api", setupKitchenRoutes(dbConnection));
    app.use("/api", setupPaymentRoutes(dbConnection));
    app.use(setupPaymentWebhookRoute(dbConnection));

    // Health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    const server = app.listen(port, () => {
      console.log(`FastFood app listening on http://localhost:${port}`);
    });

    return server;
  }
}
