import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { HealthController } from '@/common/health.controller';
import { GatewayModule } from '@/gateway/gateway.module';
import { ExceptionLoggingFilter } from '@/logging/exceptionLogging.filter';
import { LoggingModule } from '@/logging/logging.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    GatewayModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ExceptionLoggingFilter },
  ],
})
export class AppModule {}
