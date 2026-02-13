import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

const REQUIRED_PROJECT_ID = "cashflow-483906";

const normalizeEnv = (value: string | undefined): string => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  // Handle values copied with wrapping quotes from .env examples.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

type FirebaseConfigShape = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const requiredVars: Array<[name: string, value: string | undefined]> = [
  ["VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY],
  ["VITE_FIREBASE_AUTH_DOMAIN", import.meta.env.VITE_FIREBASE_AUTH_DOMAIN],
  ["VITE_FIREBASE_PROJECT_ID", import.meta.env.VITE_FIREBASE_PROJECT_ID],
  ["VITE_FIREBASE_STORAGE_BUCKET", import.meta.env.VITE_FIREBASE_STORAGE_BUCKET],
  ["VITE_FIREBASE_MESSAGING_SENDER_ID", import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID],
  ["VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID],
];

export const getMissingFirebaseEnvVars = (): string[] =>
  requiredVars
    .filter(([, value]) => normalizeEnv(value) === "")
    .map(([name]) => name);

export const isFirebaseConfigured = (): boolean =>
  getMissingFirebaseEnvVars().length === 0;

export const getFirebaseProjectId = (): string =>
  normalizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || "(unconfigured)";

const buildFirebaseConfig = (): FirebaseConfigShape => {
  const config: FirebaseConfigShape = {
    apiKey: normalizeEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: normalizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: normalizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: normalizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: normalizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: normalizeEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  };

  const missing = getMissingFirebaseEnvVars();
  if (missing.length > 0) {
    throw new Error(`Missing required env var: ${missing[0]}`);
  }

  if (config.projectId !== REQUIRED_PROJECT_ID) {
    throw new Error(
      `Invalid Firebase project: ${config.projectId}. Expected ${REQUIRED_PROJECT_ID}.`
    );
  }
  return config;
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (appInstance) return appInstance;
  appInstance = initializeApp(buildFirebaseConfig());
  return appInstance;
};

export const getDb = (): Firestore => {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
};
