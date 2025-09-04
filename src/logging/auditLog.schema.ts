import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop() method: string;
  @Prop() path: string;
  @Prop() userId?: string;
  @Prop() role?: string;
  @Prop() statusCode: number;
  @Prop() targetService?: string;
  @Prop() ip?: string;
  @Prop({ type: Object }) headers?: Record<string, any>;
  @Prop() durationMs?: number;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
