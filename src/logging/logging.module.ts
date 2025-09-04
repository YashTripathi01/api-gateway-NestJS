import { AuditLog, AuditLogSchema } from '@/logging/auditLog.schema';
import { AuditLoggerService } from '@/logging/auditLogger.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuditLoggerService],
  exports: [AuditLoggerService],
})
export class LoggingModule {}
