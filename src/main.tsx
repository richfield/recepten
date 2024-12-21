import 'bootstrap/dist/css/bootstrap.min.css';
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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARTshsQJPtDELd3W6wffxDXdXvOT3jutc",
  authDomain: "recepten-da616.firebaseapp.com",
  projectId: "recepten-da616",
  storageBucket: "recepten-da616.appspot.com",
  messagingSenderId: "291820331748",
  appId: "1:291820331748:web:5212db9b93a8dceef602f1",
  measurementId: "G-474Q37Q7TS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Function to handle Google Sign-In
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('User signed in:', user);
    // You can redirect or update the state based on user info
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

export { auth, signInWithGoogle };