import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB5Cv-DpM3duA-59PUpWlr2sP5vLZZrIv8",
  authDomain: "pizzaria-do-telles.firebaseapp.com",
  projectId: "pizzaria-do-telles",
  storageBucket: "pizzaria-do-telles.firebasestorage.app",
  messagingSenderId: "289434079091",
  appId: "1:289434079091:web:7ab38595eea2a890a97f06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);

// Get Firestore instance
export const db = getFirestore(app);

export default app;