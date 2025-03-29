// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
//import { getFirestore } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

// ✅ Correct Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBa-3Urpfzq-RN66bxwAcqr0v5DoRl3MaE", // Ensure this is correct from Firebase Console
  authDomain: "ziota-aa366.firebaseapp.com",
  projectId: "ziota-aa366",
  storageBucket:"ziota-aa366.firebasestorage.app", // ✅ Fixed Storage Bucket
  messagingSenderId: "311889063257",
  appId: "1:311889063257:web:8883034d831e5812f2f048",
  measurementId: "G-SW6CGL2B88"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize Firebase Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
//const db = getFirestore(app);

export { auth, provider, signInWithPopup, signOut};