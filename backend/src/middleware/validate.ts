import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

/**
 * Higher-order middleware to validate request body against a Zod schema
 */
export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = await schema.parseAsync(req.body);
    req.body = validated; // Use the parsed (and possibly transformed) data
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.issues.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(500).json({ success: false, error: 'Internal validation error' });
  }
};
