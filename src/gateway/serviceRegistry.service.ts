import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface RouteConfig {
  prefix: string; // path prefix (e.g., /api/v1/service1)
  target: string; // target base URL (e.g., http://service1:3000)
  stripPrefix?: boolean; // remove the prefix when forwarding
  timeout?: number; // proxy timeout in ms
  public?: boolean;
}

export interface ServicesFile {
  routes: RouteConfig[];
}

@Injectable()
export class ServiceRegistry implements OnModuleInit {
  private readonly logger = new Logger(ServiceRegistry.name);
  private routes: RouteConfig[] = [];

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const file = this.config.get<string>('SERVICE_ROUTES_FILE', '');
    const resolved = path.resolve(process.cwd(), file);

    if (!fs.existsSync(resolved)) {
      throw new Error(`SERVICE_ROUTES_FILE not found at ${resolved}`);
    }

    const raw = fs.readFileSync(resolved, 'utf-8');
    const data = JSON.parse(raw) as ServicesFile;

    this.routes = (data.routes || [])
      .map((r) => ({
        ...r,
        prefix: r.prefix.replace(/\/$/, ''),
        target: r.target.replace(/\/$/, ''),
        stripPrefix: r.stripPrefix ?? true,
        public: r.public ?? false,
      }))
      // ensure longest-prefix match order
      .sort((a, b) => b.prefix.length - a.prefix.length);

    this.logger.log(`Loaded ${this.routes.length} service route(s)`);
    this.routes.forEach((r) =>
      this.logger.log(
        `${r.prefix} -> ${r.target} (public=${r.public}, stripPrefix=${r.stripPrefix})`,
      ),
    );
  }

  /** Returns the matching route using longest prefix match */
  match(pathname: string): RouteConfig | undefined {
    return this.routes.find(
      (r) => pathname === r.prefix || pathname.startsWith(r.prefix + '/'),
    );
  }
}
