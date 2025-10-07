import "dotenv/config";
import { setupCategoryRoutes } from "./CategoryApi";
import { setupProductRoutes } from "./ProductApi";
import { setupCustomerRoutes } from "./CustomerApi";
import { setupOrderRoutes } from "./OrderApi";
import { setupKitchenRoutes } from "./KitchenApi";
import { setupPaymentRoutes } from "./PaymentApi";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { IDatabaseConnection } from "../interfaces/IDbConnection";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { setupPaymentWebhookRoute } from "./PaymentWebhookApi";

export class FastFoodApp {
  start(dbConnection: IDatabaseConnection) {
    const app = express();
    app.use(express.json());
    const port = process.env.PORT ?? 3000;

    // Swagger UI (safe init). If swagger generation fails, don't crash the app.
    const baseSwaggerOptions = {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Fast Food API",
          version: "1.0.0",
        },
      },
    };

    // First try: read JSDoc from TypeScript sources (works when swagger-jsdoc can parse ts)
    try {
      const swaggerOptions = {
        ...baseSwaggerOptions,
        apis: ["src/infrastructure/api/*.ts", "src/presentation/controllers/*.ts"],
      };

      const swaggerSpec = swaggerJsdoc(swaggerOptions);
      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
      console.log('Swagger UI mounted at /api-docs (from TS sources)');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Swagger generation from TS failed:", (err as any)?.message || err);

      // Second attempt: if project is built, try to generate from compiled JS in dist
      try {
        const distDir = path.resolve(process.cwd(), "dist");
        if (fs.existsSync(distDir)) {
          const swaggerOptionsDist = {
            ...baseSwaggerOptions,
            apis: ["dist/infrastructure/api/*.js", "dist/presentation/controllers/*.js", "dist/**/controllers/*.js"],
          };

          const swaggerSpecDist = swaggerJsdoc(swaggerOptionsDist);
          app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecDist));
          console.log('Swagger UI mounted at /api-docs (from compiled dist JS)');
          return;
        }
      } catch (err2) {
        console.warn("Swagger generation from dist failed:", (err2 as any)?.message || err2);
      }
      // Third attempt: try to collect @openapi YAML blocks from source files manually
      try {
        // Scan a few likely source locations for @openapi blocks (api folder and controllers)
        const scanDirs = [
          path.resolve(process.cwd(), "src/infrastructure/api"),
          path.resolve(process.cwd(), "src/presentation/controllers"),
        ];

        const mergedSpec: any = {
          openapi: "3.0.0",
          info: { title: "Fast Food API", version: "1.0.0" },
          paths: {},
          components: { schemas: {} },
        };

        let foundAny = false;

        for (const dir of scanDirs) {
          if (!fs.existsSync(dir)) continue;
          const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
          for (const file of files) {
            const abs = path.join(dir, file);
            const content = fs.readFileSync(abs, "utf8");
            // find JSDoc-style block comments that contain @openapi
            const blocks = content.match(/\/\*\*[\s\S]*?\*\//g) || [];
            if (blocks.length === 0) continue;
            for (const block of blocks) {
              if (!block.includes("@openapi")) continue;
              foundAny = true;
              // strip comment delimiters and the @openapi tag
              let yamlText = block.replace(/\/\*\*|\/\*|\*\//g, "").replace(/@openapi/, "");

              // normalize line endings and remove leading '*' from lines but keep list markers
              const lines = yamlText
                .split(/\r?\n/)
                .map((l) => l.replace(/^\s*\*\s?/, ""))
                .map((l) => l.replace(/\t/g, "  "))
                .filter((l) => l.trim() !== "" && l.trim() !== "/" && l.trim() !== "*/");

              // try to find a YAML start; otherwise use the whole block
              const startIdx = lines.findIndex((l) => /^\s*(openapi:\s*|paths:\s*|components:\s*|\/[\w\-\/\{\}]+)/i.test(l));
              const candidate = startIdx >= 0 ? lines.slice(startIdx).join("\n") : lines.join("\n");

              try {
                const docs = yaml.loadAll(candidate) as any[];
                for (const doc of docs) {
                  if (!doc || typeof doc !== "object") continue;

                  // merge top-level paths
                  if (doc.paths && typeof doc.paths === "object") {
                    for (const p of Object.keys(doc.paths)) mergedSpec.paths[p] = doc.paths[p];
                  }

                  // merge components.schemas
                  if (doc.components && typeof doc.components === "object") {
                    const schemas = doc.components.schemas || doc.components;
                    if (schemas && typeof schemas === "object") {
                      mergedSpec.components.schemas = { ...mergedSpec.components.schemas, ...schemas };
                    }
                  }

                  // documents that directly list paths at top-level
                  for (const key of Object.keys(doc)) {
                    if (key.startsWith("/")) mergedSpec.paths[key] = doc[key];
                  }
                }
              } catch (parseErr) {
                console.warn(`Failed to parse @openapi block in ${abs}:`, (parseErr as any)?.message || parseErr);
              }
            }
          }
        }

        if (foundAny) {
          const pathCount = Object.keys(mergedSpec.paths).length;
          const compCount = Object.keys(mergedSpec.components.schemas || {}).length;
          if (pathCount > 0) {
            app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(mergedSpec));
            console.log(`Swagger UI mounted at /api-docs (from manual @openapi extraction). paths=${pathCount} components=${compCount}`);
            return;
          }
          console.warn(`Manual @openapi extraction found blocks but no paths/components could be parsed. blocksFound=true`);
        }
      } catch (manualErr) {
        console.warn("Manual @openapi extraction failed:", (manualErr as any)?.message || manualErr);
      }

      // Final fallback: minimal spec so UI isn't empty
      const fallbackSpec = {
        openapi: "3.0.0",
        info: { title: "Fast Food API (fallback)", version: "1.0.0" },
        paths: {
          "/health": {
            get: {
              summary: "Health check",
              responses: { "200": { description: "OK" } },
            },
          },
        },
      };

      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(fallbackSpec));
      console.log('Fallback Swagger UI mounted at /api-docs');
    }

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
