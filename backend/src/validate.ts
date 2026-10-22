import { z } from 'zod';

// Query-string validators shared by the routes. A failed parse throws a
// ZodError, which the error handler turns into a 400.
export const limit = (max = 100) => z.coerce.number().int().min(1).max(max);
export const isoDate = z.iso.date();
export const uuid = z.uuid();
