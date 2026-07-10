export type Service = { title: string; slug: string; description: string; features: string[] };
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'spam';
export type Lead = {
  name: string; company: string; email: string; phone?: string; businessWebsite?: string;
  serviceInterestedIn: string; budget: string; message: string; status: LeadStatus;
  notes: string[]; source: string; createdAt: unknown; updatedAt: unknown;
};
