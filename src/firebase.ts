import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALUloNt0HWTMeP4IARvRMS9JY-R5_NnFM",
  authDomain: "nistha-passi-core.firebaseapp.com",
  projectId: "nistha-passi-core",
  storageBucket: "nistha-passi-core.firebasestorage.app",
  messagingSenderId: "299692286010",
  appId: "1:299692286010:web:dde7cadaf9ff8e53aa5503",
  measurementId: "G-3W76CF0690"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
