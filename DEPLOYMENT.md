# Soto Websites Deployment Guide

Domain: `sotowebsites.com`  
Business name: `Soto Websites`  
Tagline: `Websites That Grow Local Businesses`

This project is ready to deploy as an Astro static site on Netlify with a Netlify Function for the contact form. The function stores leads in Firebase Firestore and sends email notifications through Resend.

## 1. Install tools

Install these on your computer:

- Node.js 20 or newer
- Git
- GitHub account
- Netlify account
- Firebase account
- Resend account

Check Node:

```bash
node -v
npm -v
```

## 2. Open the project

Unzip the project, open the folder in VS Code, then run:

```bash
npm install
npm run dev
```

Open the local URL that Astro gives you, usually:

```txt
http://localhost:4321
```

## 3. Update your business info

Edit this file:

```txt
src/data/site.ts
```

Update:

- Phone number
- Email address
- City/service area if needed
- Testimonials when you have real ones
- Services if your offer changes

Important current values:

```ts
name: 'Soto Websites'
url: 'https://sotowebsites.com'
email: 'hello@sotowebsites.com'
```

## 4. Create Firebase project

1. Go to Firebase Console.
2. Create a project named `Soto Websites`.
3. Go to Firestore Database.
4. Create database.
5. Start in production mode.
6. Pick the closest region.

The contact form uses the Firebase Admin SDK inside a Netlify Function, so the browser does not directly write to Firestore.

## 5. Create Firebase service account key

1. Firebase Console → Project settings.
2. Service accounts.
3. Generate new private key.
4. Download the JSON file.

You will need these values from the JSON:

```txt
project_id
client_email
private_key
```

## 6. Create Resend account for email notifications

1. Create a Resend account.
2. Add and verify `sotowebsites.com`.
3. Add DNS records Resend gives you.
4. Create an API key.
5. Use an email like:

```txt
leads@sotowebsites.com
```

Recommended notification setup:

```txt
From: Soto Websites <leads@sotowebsites.com>
To: your real inbox
```

## 7. Create local `.env` file

Copy:

```bash
cp .env.example .env
```

Fill in:

```txt
CONTACT_TO_EMAIL=your-email@example.com
CONTACT_FROM_EMAIL=Soto Websites <leads@sotowebsites.com>
RESEND_API_KEY=re_xxxxx
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Keep `.env` private. Do not commit it to GitHub.

## 8. Test the build locally

Run:

```bash
npm run build
npm run preview
```

The build command runs Astro type checks and generates the production site.

## 9. Push to GitHub

```bash
git init
git add .
git commit -m "Initial Soto Websites site"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## 10. Deploy to Netlify

1. Netlify → Add new site.
2. Import from GitHub.
3. Select the Soto Websites repo.
4. Build command:

```bash
npm run build
```

5. Publish directory:

```txt
dist
```

6. Functions directory is already configured in `netlify.toml`:

```txt
netlify/functions
```

## 11. Add environment variables in Netlify

Netlify → Site configuration → Environment variables.

Add:

```txt
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
RESEND_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

For `FIREBASE_PRIVATE_KEY`, paste the key with newline escapes like this:

```txt
-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n
```

## 12. Connect `sotowebsites.com`

In Netlify:

1. Domain management.
2. Add custom domain.
3. Enter:

```txt
sotowebsites.com
www.sotowebsites.com
```

At your domain registrar, point DNS to Netlify using Netlify's instructions.

Recommended:

- Primary domain: `sotowebsites.com`
- Redirect `www.sotowebsites.com` to `sotowebsites.com`
- Enable HTTPS after DNS verifies

## 13. Test the live contact form

After deploy:

1. Go to `https://sotowebsites.com/contact`.
2. Submit a test lead.
3. Confirm Firestore has a new document in `leads`.
4. Confirm you received the email notification.
5. Reply to the email to make sure it replies to the lead's email.

## 14. Before launch checklist

- Replace placeholder phone number.
- Replace placeholder testimonials or keep generic until real proof exists.
- Replace Privacy Policy and Terms with attorney-reviewed wording.
- Add real portfolio screenshots once available.
- Verify Resend domain DNS.
- Verify Netlify HTTPS.
- Submit sitemap in Google Search Console.
- Create/optimize Google Business Profile.

## 15. Recommended SMS notification path

For now, use email notifications first because they are cheaper and simpler.

Best SMS upgrade later:

- Use Twilio from the same Netlify Function.
- Send a short text when a qualified lead comes in.
- Keep email as the full lead record.

Avoid email-to-text gateways for production. They are free, but unreliable and carrier-dependent.

## 16. Firestore lead structure

Collection:

```txt
leads
```

Fields:

```txt
name
company
email
phone
businessWebsite
serviceInterestedIn
budget
message
status
notes
source
userAgent
ipHashSource
createdAt
updatedAt
```

Future statuses:

```txt
new
contacted
qualified
proposal_sent
won
lost
spam
```

## 17. Important project files

```txt
src/data/site.ts                    Main brand/business content
src/pages/index.astro                Homepage
src/components/forms/ContactForm.astro Contact form UI
netlify/functions/submit-lead.ts     Server-side form handler
src/lib/firebase/admin.ts            Firebase Admin setup
src/lib/validation/lead.ts           Form validation schema
astro.config.mjs                     Astro site URL and sitemap config
netlify.toml                         Netlify build/functions config
public/robots.txt                    Search engine crawl settings
```
