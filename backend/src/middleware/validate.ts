import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        const field = e.path.join(".");
        errors[field] = e.message;
      });
      res.status(400).json({ success: false, message: "Validation failed", errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
