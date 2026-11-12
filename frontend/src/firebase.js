
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh76knHg3Y71NBYvyUW9dHyosNU0pFFow",
  authDomain: "taskflow-47650.firebaseapp.com",
  projectId: "taskflow-47650",
  storageBucket: "taskflow-47650.firebasestorage.app",
  messagingSenderId: "206700506066",
  appId: "1:206700506066:web:8c87b6d3cdf59bcad1b60b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

export default app;
