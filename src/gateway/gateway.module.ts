import { JwtAuthMiddleware } from '@/gateway/jwtAuth.middleware';
import { ProxyMiddleware } from '@/gateway/proxy.middleware';
import { RbacMiddleware } from '@/gateway/rbac.middleware';
import { ServiceRegistry } from '@/gateway/serviceRegistry.service';
import { AuditLoggerMiddleware } from '@/logging/auditLogger.middleware';
import { LoggingModule } from '@/logging/logging.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, LoggingModule],
  providers: [
    ServiceRegistry,
    JwtAuthMiddleware,
    RbacMiddleware,
    AuditLoggerMiddleware,
    ProxyMiddleware,
  ],
})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        JwtAuthMiddleware,
        RbacMiddleware,
        AuditLoggerMiddleware,
        ProxyMiddleware,
      )
      .exclude({ path: 'health', method: RequestMethod.ALL })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
