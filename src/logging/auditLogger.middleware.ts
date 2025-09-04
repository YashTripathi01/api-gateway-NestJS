import { AuthenticatedRequest } from '@/gateway/jwtAuth.middleware';
import { AuditLoggerService } from '@/logging/auditLogger.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

@Injectable()
export class AuditLoggerMiddleware implements NestMiddleware {
  constructor(private readonly audit: AuditLoggerService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      this.audit.log({
        method: req.method,
        path: (req as any).originalUrl || req.url,
        userId: req.user?.userId,
        role: req.user?.role,
        statusCode: res.statusCode,
        targetService: (req as any).targetService,
        ip: req.ip,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
        },
        durationMs: duration,
      });
    });

    next();
  }
}
