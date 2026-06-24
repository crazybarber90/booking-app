import { z } from "zod";
import { isFutureExpiry, luhnCheck } from "./card-utils";

/**
 * Zod šema za payment formu (korak 4). Pravila prate API (ENDPOINTS.md):
 * kartica 12–19 cifara + Luhn, MM/YY u budućnosti, CVV 3–4 cifre. `cardNumber`
 * se kuca sa razmacima, ali se za validaciju/slanje očiste razmaci.
 */
export const paymentSchema = z.object({
  // Guest details
  email: z.string().min(1, "Obavezno").email("Unesi ispravan email"),
  firstName: z.string().min(1, "Obavezno"),
  lastName: z.string().min(1, "Obavezno"),
  countryCode: z.string().min(1),
  phone: z.string().min(3, "Unesi broj telefona"),
  comments: z.string().optional(),

  // Payment method (DEV-ONLY, mock)
  cardNumber: z
    .string()
    .min(1, "Obavezno")
    .refine((v) => /^\d{12,19}$/.test(v.replace(/\s/g, "")), "12–19 cifara")
    .refine((v) => luhnCheck(v), "Neispravan broj kartice"),
  expiration: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format MM/YY")
    .refine(isFutureExpiry, "Kartica je istekla"),
  cvv: z.string().regex(/^\d{3,4}$/, "3–4 cifre"),
  holderFirst: z.string().min(1, "Obavezno"),
  holderLast: z.string().min(1, "Obavezno"),

  // Saglasnosti
  newsletter: z.boolean().optional(),
  terms: z.boolean().refine((v) => v === true, "Moraš prihvatiti uslove"),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
