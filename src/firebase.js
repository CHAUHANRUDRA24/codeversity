import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA66J04MAuWDVDqPHa4OHlEo41h0Bvmxng",
  authDomain: "codeversity-bfb92.firebaseapp.com",
  projectId: "codeversity-bfb92",
  storageBucket: "codeversity-bfb92.firebasestorage.app",
  messagingSenderId: "389071474550",
  appId: "1:389071474550:web:c3717973b62caad93d7457",
  measurementId: "G-3XXPZ18XV6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
