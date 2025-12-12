import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these with your Firebase project configuration
const firebaseConfig = { apiKey: "AIzaSyDZWHy5afJytK_1VpaE-I3_S59KESLlqmY", authDomain: "reciptchecker.firebaseapp.com", projectId: "reciptchecker", storageBucket: "reciptchecker.firebasestorage.app", messagingSenderId: "521450606426", appId: "1:521450606426:web:787b75f1efc592f474ed63", measurementId: "G-63QK8SERT7" };
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
