import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required.").max(100, "Name is too long."),
  email: z.string().email("Enter a valid email address.").max(254, "Email is too long."),
  message: z.string().min(10, "Please share a little more detail.").max(2000, "Message is too long."),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address.").max(254, "Email is too long."),
  // Honeypot field for bot detection (should be empty)
  website: z.string().optional().refine((val) => !val || val.length === 0, {
    message: "Spam detected",
  }),
});
