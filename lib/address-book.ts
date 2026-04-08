import { z } from "zod";
import { onlyDigits } from "@/lib/shipping";

export const addressInputSchema = z.object({
  label: z.string().trim().min(2).max(40),
  recipientName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20).optional().default(""),
  zipCode: z.string().trim().min(8).max(10),
  line1: z.string().trim().min(4).max(120),
  line2: z.string().trim().max(120).optional().default(""),
  neighborhood: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(40),
  country: z.string().trim().min(2).max(40).optional().default("BR"),
  isDefaultShipping: z.boolean().optional().default(false),
  isDefaultBilling: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export function normalizeAddressInput(input: AddressInput) {
  return {
    label: input.label.trim(),
    recipientName: input.recipientName.trim(),
    phone: input.phone.trim() || null,
    zipCode: onlyDigits(input.zipCode),
    line1: input.line1.trim(),
    line2: input.line2.trim() || null,
    neighborhood: input.neighborhood.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    country: input.country.trim().toUpperCase() || "BR",
    isDefaultShipping: Boolean(input.isDefaultShipping),
    isDefaultBilling: Boolean(input.isDefaultBilling),
  };
}
