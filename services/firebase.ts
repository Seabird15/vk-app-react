import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDmfahTShGZxIyeaCNUbOkAepw5T-caJaU",
  authDomain: "web-vikingas.firebaseapp.com",
  projectId: "web-vikingas",
  storageBucket: "web-vikingas.firebasestorage.app",
  messagingSenderId: "537242760349",
  appId: "1:537242760349:web:bafa94b13170fd5e0e9074"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
