import { z } from "zod";
import { CAMPAIGN } from "./campaign";

const int = (max: number) => z.number().int().min(CAMPAIGN.minRosesPerDestination).max(max);

export const destinationSchema = z.object({
  street: z.string().trim().min(3).max(160),
  postalCode: z.string().trim().regex(/^\d{5}$/),
  city: z.string().trim().min(2).max(80),
  roses: int(CAMPAIGN.maxRosesPerDestination),
  notes: z.string().trim().max(300).optional().default(""),
  slot: z.enum(CAMPAIGN.deliverySlots),
});

export const addressSchema = destinationSchema.pick({ street: true, postalCode: true, city: true });

export const contactSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().default(""),
  company: z.string().trim().min(2).max(160), // razón social — the campaign is B2B only and every order is invoiced
  taxId: z.string().trim().max(30).optional().default(""),
  fiscalAddress: z.string().trim().max(300).optional().default(""),
  billingEmail: z.union([z.string().email().max(200), z.literal("")]).optional().default(""),
  notes: z.string().trim().max(1500).optional().default(""),
});

export const submitSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    lang: z.enum(["ca", "es"]),
    mode: z.enum(["pickup", "delivery"]),
    paymentPlan: z.enum(['single', 'split']).default('single'),
    pickupRoses: z.number().int().min(0).max(CAMPAIGN.maxRosesPerDestination * CAMPAIGN.maxDestinations),
    destinations: z.array(destinationSchema).max(CAMPAIGN.maxDestinations),
    contact: contactSchema,
    shownShipping: z.array(z.number().nullable()).max(CAMPAIGN.maxDestinations),
    acceptChanges: z.boolean().default(false),
    website: z.string().max(0).optional().default(""), // honeypot
  })
  .superRefine((v, ctx) => {
    if (v.mode === "pickup" && v.pickupRoses < CAMPAIGN.minRosesPerDestination) ctx.addIssue({ code: "custom", path: ["pickupRoses"], message: "roses" });
    if (v.mode === "delivery" && v.destinations.length < 1) ctx.addIssue({ code: "custom", path: ["destinations"], message: "destinations" });
    const phone = v.contact.phone.replace(/\s/g, "");
    if (v.mode === "delivery" && !/^\+?\d{9,15}$/.test(phone)) ctx.addIssue({ code: "custom", path: ["contact", "phone"], message: "phone" });
    if (v.mode === "pickup" && phone && !/^\+?\d{9,15}$/.test(phone)) ctx.addIssue({ code: "custom", path: ["contact", "phone"], message: "phone" });
  });

export type SubmitInput = z.input<typeof submitSchema>;
