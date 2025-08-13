import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader =
      req.headers["Authorization"] || req.headers["authorization"]; // or 'authorization' if using Bearer tokens

    if (!authHeader || typeof authHeader !== "string") {
      throw new UnauthorizedException(
        "Missing or invalid token in request headers."
      );
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException(
        "Invalid Authorization header format. Use: Bearer <token>."
      );
    }
    (req as any).token = token;
    next();
  }
}
