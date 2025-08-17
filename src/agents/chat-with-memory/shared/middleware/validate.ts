// validate.ts
// Express middleware'i sifatida ishlatiladigan validatsiya funksiyasi.
// Zod sxemasi orqali so'rov tanasini (body) tekshiradi.
import { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "ValidationError", details: parsed.error.flatten() });

    (req as any).validated = parsed.data;
    next();
  };
};
