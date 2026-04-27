// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMPExuIhLtBCOhATd0U3gGXwQ2Jtc1Jd4",
  authDomain: "copper-6b102.firebaseapp.com",
  projectId: "copper-6b102",
  storageBucket: "copper-6b102.appspot.com",
  messagingSenderId: "1008568307786",
  appId: "1:1008568307786:web:d51ea4f7892ed2fb7656b3",
  measurementId: "G-WT9KST1XM3"
};

// Initialize Firebase (only if it hasn't been initialized already)
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Cloud Messaging
const messaging = async () => {
  // Ensure FCM is supported in the current environment (browser)
  const supported = await isSupported();
  return supported ? getMessaging(firebaseApp) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY, // Your public VAPID key
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export default firebaseApp;
