import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  // The user property is optional as it may not exist on public routes.
  user?: any;
}
