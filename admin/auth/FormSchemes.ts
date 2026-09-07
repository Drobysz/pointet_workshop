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
  avatar_url: z.union([z.url(), z.literal("")]),
  password: z.union([passwordSchema, z.literal("")]),
});

export const goodSchema = z.object({
  name: z.string().trim().min(1).max(255),
  category_id: z.coerce.number().int().positive(),
  subcategory_id: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  current_quantity: z.coerce.number().int().min(0),
  description: z.string().trim().min(1).max(65_535),
  color_ids: z.array(z.coerce.number().int().positive()),
  material_ids: z.array(z.coerce.number().int().positive()),
});
