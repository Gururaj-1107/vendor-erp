import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyFakeKeyPlaceholderForLocalDemoOnly",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vendorbridge.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vendorbridge",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vendorbridge.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

let app;
let auth;
let googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (err) {
  console.warn("Firebase failed to initialize (using mock auth fallback):", err.message);
  auth = {
    currentUser: null,
    onAuthStateChanged: () => {
      return () => {};
    }
  };
  googleProvider = {};
}

export { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
};
