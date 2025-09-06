import { ServiceRegistry } from '@/gateway/serviceRegistry.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
  constructor(private readonly registry: ServiceRegistry) {}

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const match = this.registry.match(req.path);
    if (match?.public) return next();

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
