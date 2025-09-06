import { ServiceRegistry } from '@/gateway/serviceRegistry.service';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);

  constructor(private readonly registry: ServiceRegistry) {}

  use(req: Request, res: Response, next: NextFunction) {
    // ensure request-id and expose to client
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    res.setHeader('x-request-id', requestId);

    // match the upstream from registry
    const match = this.registry.match(req.path);
    if (!match) {
      this.logger.warn(`No route for ${req.method} ${req.path}`);
      return res
        .status(502)
        .json({ message: 'No upstream route for request', requestId });
    }

    // Helpful for audit logging
    (req as any).targetService = match.target;

    // v3 API: use `on` for events and `logger` instead of logProvider
    const proxy = createProxyMiddleware({
      target: match.target,
      changeOrigin: true,
      ws: true,
      secure: false,
      proxyTimeout: match.timeout ?? 30_000,
      timeout: match.timeout ?? 30_000,

      // Keep query string; we only rewrite the path portion.
      pathRewrite: {
        [`^${match.prefix}`]: match.stripPrefix ? '' : match.prefix,
      },

      on: {
        proxyReq: (proxyReq, r) => {
          proxyReq.setHeader('x-request-id', requestId);
          proxyReq.setHeader(
            'x-forwarded-host',
            (r as Request).headers.host || '',
          );
          proxyReq.setHeader(
            'x-forwarded-proto',
            (r as any).protocol || 'http',
          );

          if (
            req.body &&
            Object.keys(req.body).length &&
            req.headers['content-type']?.includes('application/json')
          ) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },

        error: (err, _r, resp) => {
          this.logger.error(`Proxy error: ${err.message}`);
          if (!(resp as Response).headersSent) {
            (resp as Response)
              .status(502)
              .json({ message: 'Upstream error', requestId });
          }
        },
      },

      // Only info/warn/error are used by v3 middleware.
      logger: {
        info: (msg: string) => this.logger.log(msg),
        warn: (msg: string) => this.logger.warn(msg),
        error: (msg: string) => this.logger.error(msg),
      },
    });

    return proxy(req, res, next);
  }
}
