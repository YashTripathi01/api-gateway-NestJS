import { AuditLog } from '@/logging/auditLog.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);

  constructor(@InjectModel(AuditLog.name) private model: Model<AuditLog>) {}

  async log(entry: Partial<AuditLog>) {
    try {
      await this.model.create(entry);
    } catch (err) {
      this.logger.error(`Failed to save audit log: ${err.message}`);
    }
  }
}
