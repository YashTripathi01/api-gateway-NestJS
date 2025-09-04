import { AuthenticatedRequest } from '@/gateway/jwtAuth.middleware';
import { ServiceRegistry } from '@/gateway/serviceRegistry.service';
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface RbacRule {
  method: string;
  route: string;
  permissions: string[];
}

@Injectable()
export class RbacMiddleware implements NestMiddleware {
  private rules: RbacRule[] = [];

  constructor(private readonly registry: ServiceRegistry) {
    const filePath = path.join(process.cwd(), 'config', 'rbac.json');
    if (fs.existsSync(filePath)) {
      this.rules = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }

  private permissionMatches(userPerm: string, required: string): boolean {
    if (userPerm === '*') return true;

    // Escape regex special chars, replace "*" with ".*"
    const regex = new RegExp(
      '^' + userPerm.split('*').map(this.escapeRegex).join('.*') + '$',
    );
    return regex.test(required);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  }

  use(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const match = this.registry.match(req.path);

    if (match?.public) return next(); // public routes bypass RBAC

    if (!req.user) {
      throw new ForbiddenException('No user attached to request');
    }

    const rule = this.rules.find(
      (r) => r.method === req.method && r.route === req.baseUrl + req.path,
    );

    if (!rule) {
      throw new ForbiddenException('Access denied: no RBAC rule found');
    }

    const hasPermission = rule.permissions.some((required) =>
      req.user.permissions.some((p) => this.permissionMatches(p, required)),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return next();
  }
}
