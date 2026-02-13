import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { getDb } from "../config/firebase";

export type TelegramLinkCode = {
  id: string;
  code: string;
  businessId: string;
  businessName: string;
  expiresAt: number;
  used: boolean;
  usedAt?: number;
  usedBy?: string;
  createdAt: number;
  createdBy: string;
};

const LINK_CODES_COLLECTION = "telegram_link_codes";
const CODE_LENGTH = 6;

const randomDigits = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

const isCodeAvailable = async (code: string): Promise<boolean> => {
  const db = getDb();
  const q = query(
    collection(db, LINK_CODES_COLLECTION),
    where("code", "==", code),
    where("used", "==", false),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

const buildDocId = (businessId: string, code: string): string =>
  `${businessId}_${Date.now()}_${code}`;

export const createTelegramLinkCode = async (input: {
  businessId: string;
  businessName: string;
  expiresInMinutes: number;
  createdBy?: string;
}): Promise<TelegramLinkCode> => {
  const db = getDb();
  const expiresInMs = Math.max(1, input.expiresInMinutes) * 60 * 1000;
  const createdAt = Date.now();
  const expiresAt = createdAt + expiresInMs;
  const createdBy = input.createdBy?.trim() || "admin_portal";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = randomDigits(CODE_LENGTH);
    const available = await isCodeAvailable(code);
    if (!available) {
      continue;
    }

    const id = buildDocId(input.businessId, code);
    const payload: TelegramLinkCode = {
      id,
      code,
      businessId: input.businessId,
      businessName: input.businessName,
      expiresAt,
      used: false,
      createdAt,
      createdBy,
    };

    await setDoc(doc(db, LINK_CODES_COLLECTION, id), payload);
    return payload;
  }

  throw new Error("Failed to generate a unique code. Please retry.");
};

export const listTelegramLinkCodesByBusiness = async (
  businessId: string
): Promise<TelegramLinkCode[]> => {
  const db = getDb();
  const q = query(
    collection(db, LINK_CODES_COLLECTION),
    where("businessId", "==", businessId),
    limit(100)
  );
  const snapshot = await getDocs(q);
  const rows = snapshot.docs.map((d) => {
    const data = d.data() as Omit<TelegramLinkCode, "id"> & { id?: string };
    return {
      id: d.id,
      code: String(data.code ?? ""),
      businessId: String(data.businessId ?? ""),
      businessName: String(data.businessName ?? ""),
      expiresAt: Number(data.expiresAt ?? 0),
      used: Boolean(data.used),
      usedAt: data.usedAt ? Number(data.usedAt) : undefined,
      usedBy: data.usedBy ? String(data.usedBy) : undefined,
      createdAt: Number(data.createdAt ?? 0),
      createdBy: String(data.createdBy ?? "admin_portal"),
    } satisfies TelegramLinkCode;
  });

  return rows.sort((a, b) => b.createdAt - a.createdAt);
};

export const revokeTelegramLinkCode = async (id: string): Promise<void> => {
  const db = getDb();
  await setDoc(
    doc(db, LINK_CODES_COLLECTION, id),
    {
      used: true,
      usedAt: Date.now(),
      usedBy: "admin_portal",
    },
    { merge: true }
  );
};
