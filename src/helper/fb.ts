import { getDoc, doc, setDoc } from "firebase/firestore";
import { getDb } from "../config/firebase";

export const readDoc = async (path: string) => {
  console.log('path', path)
  try {
    const db = getDb();
    const sn = await getDoc(doc(db, path));
    return sn;
  } catch (error) {
    console.log(error);
    throw new Error("Invalid data");
  }
};
export const writeDoc = async (args: {
  docId: string,
  col: string,
  data: any
}) => {
  const { col, docId, data } = args;
  try {
    const db = getDb();
    const docRef = doc(db, col, docId);
    // Set the document with the data
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.error(e);
    throw new Error("Unexpected data")
  }
}
