import { AuthenticatedRequest } from '@/gateway/jwtAuth.middleware';
import { AuditLoggerService } from '@/logging/auditLogger.service';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ExceptionLoggingFilter implements ExceptionFilter {
  constructor(private readonly audit: AuditLoggerService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<AuthenticatedRequest>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    // Log the failure
    await this.audit.log({
      method: req.method,
      path: (req as any).originalUrl || req.url,
      userId: req.user?.userId,
      role: req.user?.role,
      statusCode: status,
      targetService: (req as any).targetService,
      ip: req.ip,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    });

    // Delegate to Nest default error body
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      return res.status(status).json(body);
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
