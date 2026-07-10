import type { Handler } from '@netlify/functions';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { z } from 'zod';
import { getAdminDb } from '../../src/lib/firebase/admin';
import { leadSchema } from '../../src/lib/validation/lead';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const hit = ipHits.get(ip);
  if (!hit || hit.resetAt < now) { ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  hit.count += 1;
  return hit.count > MAX_PER_WINDOW;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
  if (rateLimit(ip)) return { statusCode: 429, body: JSON.stringify({ message: 'Too many submissions. Try again shortly.' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const parsed = leadSchema.parse(body);
    if (parsed.website) return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    if (parsed.startedAt && Date.now() - Number(parsed.startedAt) < 2500) return { statusCode: 400, body: JSON.stringify({ message: 'Submission was too fast.' }) };

    const db = getAdminDb();
    const doc = await db.collection('leads').add({
      name: parsed.name,
      company: parsed.company,
      email: parsed.email,
      phone: parsed.phone || null,
      businessWebsite: parsed.businessWebsite || null,
      serviceInterestedIn: parsed.serviceInterestedIn,
      budget: parsed.budget,
      message: parsed.message,
      status: 'new',
      notes: [],
      source: 'website-contact-form',
      userAgent: event.headers['user-agent'] || null,
      ipHashSource: ip,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (resend && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL) {
      await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL,
        to: process.env.CONTACT_TO_EMAIL,
        subject: `New Soto Websites Lead: ${parsed.company}`,
        replyTo: parsed.email,
        text: `New lead from Soto Websites\n\nName: ${parsed.name}\nCompany: ${parsed.company}\nEmail: ${parsed.email}\nPhone: ${parsed.phone || 'N/A'}\nWebsite: ${parsed.businessWebsite || 'N/A'}\nService: ${parsed.serviceInterestedIn}\nBudget: ${parsed.budget}\n\nMessage:\n${parsed.message}\n\nFirestore ID: ${doc.id}`,
      });
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, id: doc.id }) };
  } catch (error) {
    const message = error instanceof z.ZodError ? 'Please check the form fields and try again.' : 'Something went wrong. Please try again.';
    return { statusCode: 400, body: JSON.stringify({ message }) };
  }
};
