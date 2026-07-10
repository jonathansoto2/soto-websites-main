# Soto Websites Production Plan

## Brand recommendation
Use **Soto Websites** with the tagline **Websites That Grow Local Businesses**. It is direct, benefit-focused, and easy for contractors, restaurants, coaches, clinics, and service businesses to understand immediately.

## Palette
- Primary: deep trust blue `#1d4ed8`
- Navy text: `#020617`
- Background: `#f8fafc`
- Surface: `#ffffff`
- Muted gray: `#64748b`
- Accent: light blue `#dbeafe`

This palette feels professional, local, and safe without looking like a generic tech startup.

## Typography
Use Inter or a similar modern sans-serif. Keep headings bold and direct. Avoid decorative fonts until the business has stronger visual assets.

## Logo direction
Start with a clean `SW` monogram in a rounded square. It works on favicon, invoices, social profiles, proposals, and shirts. Later, upgrade to a custom wordmark once revenue validates the brand.

## Voice and messaging
Plainspoken, confident, and business-first. Speak to outcomes: more calls, more trust, cleaner mobile experience, less tech stress. Avoid overpromising SEO or ad results before proof exists.

## Firestore structure
Recommended starter collection:

`leads/{leadId}`
- name
- company
- email
- phone
- businessWebsite
- serviceInterestedIn
- budget
- message
- status: new/contacted/qualified/won/lost/spam
- notes: array initially, later subcollection
- source
- createdAt
- updatedAt

Future scalable structure:
- `clients/{clientId}`
- `clients/{clientId}/projects/{projectId}`
- `clients/{clientId}/invoices/{invoiceId}`
- `clients/{clientId}/contacts/{contactId}`
- `emailCampaigns/{campaignId}`
- `appointments/{appointmentId}`

## Email notifications
Recommended: **Resend** from the Netlify Function. It is simple, developer-friendly, and affordable for low-volume lead notifications. Send the lead to Firestore first, then email yourself.

Alternatives:
- Twilio SendGrid: strong, but more setup than needed at this stage.
- Firebase Extensions: useful, but adds Firebase-specific moving parts and is less clean than one Netlify Function.
- Email-to-text: cheapest SMS workaround, but unreliable across carriers and can break if you do not know the carrier.

## SMS notifications
Best small-business choice: start with email notifications. Add **Twilio SMS** later only if speed matters. Twilio is reliable and scalable, but it adds monthly/compliance setup and per-message costs. For now, email plus Gmail/mobile push is enough.

## Environment variables
Set these in Netlify, not committed to Git:
- CONTACT_TO_EMAIL
- CONTACT_FROM_EMAIL
- RESEND_API_KEY
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
- TURNSTILE_SECRET_KEY later for stronger spam protection

## Architecture decisions
- Astro static pages for speed and SEO.
- Minimal client JavaScript, only the contact form script hydrates behavior.
- Netlify Function handles validation, spam checks, Firestore writes, and email notifications.
- Firebase Admin SDK stays server-side.
- Reusable components for layout, sections, UI, forms, and SEO.
- Content in `src/data` now, can move to CMS later.

## Future expansion
This structure can support admin dashboards, client dashboards, CRM, appointment scheduling, invoice systems, analytics, AI chatbot, blog CMS, and email campaign management without rewriting the public marketing site.
