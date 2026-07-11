import type { Handler, HandlerEvent } from '@netlify/functions';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';
import { ZodError } from 'zod';
import { getAdminDb } from '../../src/lib/firebase/admin';
import { leadSchema } from '../../src/lib/validation/lead';

function jsonResponse(statusCode: number, data: unknown) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
}

function getClientIp(event: HandlerEvent): string {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      message: 'Method not allowed.',
    });
  }

  let stage = 'reading request';

  try {
    stage = 'parsing form data';

    const body = JSON.parse(event.body || '{}');
    const parsed = leadSchema.parse(body);

    if (parsed.website) {
      return jsonResponse(200, { ok: true });
    }

    if (
      parsed.startedAt &&
      Date.now() - Number(parsed.startedAt) < 2500
    ) {
      return jsonResponse(400, {
        message: 'Please wait a moment before submitting the form.',
      });
    }

    stage = 'checking Firebase configuration';

    requireEnvironmentVariable('FIREBASE_PROJECT_ID');
    requireEnvironmentVariable('FIREBASE_CLIENT_EMAIL');
    requireEnvironmentVariable('FIREBASE_PRIVATE_KEY');

    stage = 'connecting to Firebase';

    const db = getAdminDb();

    stage = 'saving lead to Firestore';

    const leadRef = await db.collection('leads').add({
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    stage = 'checking Resend configuration';

    const resendApiKey =
      requireEnvironmentVariable('RESEND_API_KEY');

    const contactToEmail =
      requireEnvironmentVariable('CONTACT_TO_EMAIL');

    const contactFromEmail =
      requireEnvironmentVariable('CONTACT_FROM_EMAIL');

    stage = 'sending notification email';

    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: contactFromEmail,
      to: [contactToEmail],
      replyTo: parsed.email,
      subject: `New Soto Websites Lead: ${parsed.company}`,
      text: `
New lead from Soto Websites

Name: ${parsed.name}
Company: ${parsed.company}
Email: ${parsed.email}
Phone: ${parsed.phone || 'N/A'}
Website: ${parsed.businessWebsite || 'N/A'}
Service: ${parsed.serviceInterestedIn}
Budget: ${parsed.budget}

Message:
${parsed.message}

Firestore ID: ${leadRef.id}
      `.trim(),
    });

    if (emailResult.error) {
      throw new Error(
        `Resend error: ${emailResult.error.message}`
      );
    }

    return jsonResponse(200, {
      ok: true,
      id: leadRef.id,
    });
  } catch (error) {
    console.error(`submit-lead failed during ${stage}:`, error);

    if (error instanceof ZodError) {
      return jsonResponse(400, {
        message: 'Please check the form fields and try again.',
        stage,
      });
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return jsonResponse(500, {
      message: `Form failed while ${stage}.`,
      stage,
      error: errorMessage,
    });
  }
};