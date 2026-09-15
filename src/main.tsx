import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import App from './App.js'
import './index.css'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { BusyProvider } from "./Busy/BusyProvider.js";
import { BusyIndicator } from "./Busy/BusyIndicator.js";
import { ApplicationContextProvider } from "./Components/ApplicationContext/ApplicationContextProvider.js";
import { CssBaseline } from "@mui/material";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize Firebase Authentication
export const firebaseAuth = getAuth(app);
// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Function to handle Google Sign-In
async function signInWithGoogle() {
  try {
    await signInWithPopup(firebaseAuth, googleProvider);
  } catch (error) {
    console.error('Error during Google Sign-In:', error);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApplicationContextProvider>
        <CssBaseline />
        <BusyProvider>
          <BusyIndicator />
          <App />
        </BusyProvider>
      </ApplicationContextProvider>
    </BrowserRouter>
  </StrictMode>,
)

export { firebaseAuth as auth, signInWithGoogle };