import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD9dBJOH8mgCnM6V93arGemqb_UVmJSEkM",
  authDomain: "valamagri.firebaseapp.com",
  projectId: "valamagri",
  storageBucket: "valamagri.firebasestorage.app",
  messagingSenderId: "785681624340",
  appId: "1:785681624340:web:b05a63110584ec7fa22601",
  measurementId: "G-H6VTG965TV"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics conditionally (only runs on the browser)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
