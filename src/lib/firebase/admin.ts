import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getAdminDb() {
  if (!getApps().length) {
    const projectId =
      requireEnvironmentVariable('FIREBASE_PROJECT_ID');

    const clientEmail =
      requireEnvironmentVariable('FIREBASE_CLIENT_EMAIL');

    const privateKey =
      requireEnvironmentVariable('FIREBASE_PRIVATE_KEY')
        .replace(/\\n/g, '\n')
        .trim();

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return getFirestore();
}