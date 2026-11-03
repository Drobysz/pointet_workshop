import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-zA-Z]/)
  .regex(/\d/);

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const adminSchema = z.object({
  full_name: z.string().trim().min(2).max(255),
  email: z.email(),
  password: passwordSchema.min(12),
});

export const userSchema = z.object({
  full_name: z.string().trim().min(2).max(255),
  email: z.email(),
  password: z.union([passwordSchema, z.literal("")]),
});

export const goodSchema = z.object({
  name: z.string().trim().min(1).max(255),
  brand: z.string().trim().min(1).max(255),
  category_id: z.coerce.number().int().positive(),
  subcategory_id: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  weigh: z.coerce.number().int().min(0).default(0),
  inventory_version: z.number().int().min(0).optional(),
  inventory: z.array(z.object({
    id: z.number().int().positive().optional(),
    color_id: z.number().int().positive(),
    size: z.string().trim().max(120).nullable().transform((value) => value || null),
    quantity: z.number().int().min(0).max(2147483647),
  })).min(1).max(500).refine((rows) => {
    const keys = rows.map((row) => `${row.color_id}|${(row.size ?? "").toLowerCase()}`);
    return new Set(keys).size === keys.length && rows.reduce((total, row) => total + row.quantity, 0) <= 2147483647;
  }),
  description: z.string().trim().min(1).max(65_535),
  visible: z.boolean().default(true),
  material_ids: z.array(z.coerce.number().int().positive()),
});
