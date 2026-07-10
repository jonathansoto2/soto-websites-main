import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  company: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  businessWebsite: z.string().trim().url().max(200).optional().or(z.literal('')),
  serviceInterestedIn: z.string().trim().min(2).max(80),
  budget: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
  startedAt: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
