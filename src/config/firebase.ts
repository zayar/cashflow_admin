
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmN-1RvCRVDMUysX-XwYHXfWJHward-Sc",
  authDomain: "piti-book.firebaseapp.com",
  projectId: "piti-book",
  storageBucket: "piti-book.firebasestorage.app",
  messagingSenderId: "642822843535",
  appId: "1:642822843535:web:43f9017bb79382e33b54fa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);