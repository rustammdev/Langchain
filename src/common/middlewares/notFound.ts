import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route nor found", 404));
}
