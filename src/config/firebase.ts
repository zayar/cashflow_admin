import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const REQUIRED_PROJECT_ID = "cashflow-483906";

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value.trim();
};

const firebaseConfig = {
  apiKey: requireEnv(import.meta.env.VITE_FIREBASE_API_KEY, "VITE_FIREBASE_API_KEY"),
  authDomain: requireEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, "VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
  ),
  appId: requireEnv(import.meta.env.VITE_FIREBASE_APP_ID, "VITE_FIREBASE_APP_ID"),
};

if (firebaseConfig.projectId !== REQUIRED_PROJECT_ID) {
  throw new Error(
    `Invalid Firebase project: ${firebaseConfig.projectId}. Expected ${REQUIRED_PROJECT_ID}.`
  );
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
