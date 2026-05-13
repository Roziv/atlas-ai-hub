"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Higher-order middleware to validate request body against a Zod schema
 */
const validate = (schema) => async (req, res, next) => {
    try {
        const validated = await schema.parseAsync(req.body);
        req.body = validated; // Use the parsed (and possibly transformed) data
        next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: err.issues.map((e) => ({ path: e.path.join('.'), message: e.message }))
            });
        }
        return res.status(500).json({ success: false, error: 'Internal validation error' });
    }
};
exports.validate = validate;
