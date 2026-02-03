import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCWS5JKbRudae1z4Jn90fh71iI3RQu8b50",
  authDomain: "fir-sticky-board.firebaseapp.com",
  projectId: "fir-sticky-board",
  storageBucket: "fir-sticky-board.firebasestorage.app",
  messagingSenderId: "607689618030",
  appId: "1:607689618030:web:4a80ca5f7db6a4aae8ec7f"
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth = getAuth(app);