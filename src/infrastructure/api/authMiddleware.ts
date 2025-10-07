import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import * as https from "https";
// use jwk-to-pem for converting JWK (n/e) to PEM reliably
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwkToPem = require('jwk-to-pem');

// Simple in-memory cache for JWKS keys per issuer
const jwksCache: Record<string, Record<string, string>> = {};

function fetchJwks(issuer: string): Promise<Record<string, string>> {
  if (jwksCache[issuer]) return Promise.resolve(jwksCache[issuer]);
  const jwksUrl = issuer.replace(/\/+$/g, "") + "/.well-known/jwks.json";
  return new Promise((resolve, reject) => {
    https
      .get(jwksUrl, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            const keys: Record<string, string> = {};
            if (Array.isArray(parsed.keys)) {
              for (const k of parsed.keys) {
                if (!k.kid) continue;
                // Prefer x5c if available
                if (k.x5c && k.x5c[0]) {
                  const cert = k.x5c[0];
                  const pem = `-----BEGIN CERTIFICATE-----\n${cert.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----\n`;
                  keys[k.kid] = pem;
                  continue;
                }
                // Fallback: build PEM from n and e (RSA key)
                if (k.n && k.e) {
                  try {
                    const pem = jwkToPem(k);
                    keys[k.kid] = pem;
                  } catch (err) {
                    // ignore this key
                  }
                }
              }
            }
            jwksCache[issuer] = keys;
            resolve(keys);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

// (removed custom JWK->PEM helpers; using jwk-to-pem package)

/**
 * Middleware de autenticação JWT para rotas protegidas.
 * Espera o token no header Authorization: Bearer <token>
 *
 * - Retorna 401 se não houver token ou se for inválido/expirado.
 * - Injeta o payload decodificado em req.user se válido.
 *
 * O segredo JWT deve ser configurado via variável de ambiente JWT_SECRET.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  if (secret) {
    try {
      const decoded = jwt.verify(token, secret);
      // @ts-ignore
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  }

  // If no symmetric secret configured, try to validate as an RS256 token (e.g., Cognito)
  // Async flow: fetch JWKS, pick key by kid and verify. If AUTH_ISSUER not set, try to use the token's iss claim.
  (async () => {
    try {
      const decodedHeader = jwt.decode(token, { complete: true }) as any;
      const kid = decodedHeader && decodedHeader.header && decodedHeader.header.kid;
      if (!kid) return res.status(401).json({ error: "Token inválido (kid ausente)" });

      let authIssuer = process.env.AUTH_ISSUER || process.env.COGNITO_ISSUER;
      if (!authIssuer) {
        const decodedPayload = decodedHeader && decodedHeader.payload;
        authIssuer = decodedPayload && decodedPayload.iss;
      }

      if (!authIssuer) {
        return res.status(500).json({ error: "JWT_SECRET não configurado e AUTH_ISSUER ausente" });
      }

      const keys = await fetchJwks(authIssuer);
      const pem = keys[kid];
      if (!pem) return res.status(401).json({ error: "Chave pública não encontrada para token" });
      const decoded = jwt.verify(token, pem, { algorithms: ["RS256"] });
      // @ts-ignore
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
  })();
};
