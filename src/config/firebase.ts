import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCQ_pqiNaUd77Izvp3gqxH8-3qCTbgyQFA",
  authDomain: "triple-a-b8605.firebaseapp.com",
  projectId: "triple-a-b8605",
  storageBucket: "triple-a-b8605.firebasestorage.app",
  messagingSenderId: "182821274121",
  appId: "1:182821274121:android:db24eb55d34ad6135f2ed8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
