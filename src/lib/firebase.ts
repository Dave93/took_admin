// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDu4_6ZtApKGHNcl0PXORFyL42FGLHMeOQ",
  authDomain: "arryt-b201e.firebaseapp.com",
  projectId: "arryt-b201e",
  storageBucket: "arryt-b201e.appspot.com",
  messagingSenderId: "92327347967",
  appId: "1:92327347967:web:666cc5c7ad27855116eeca",
  measurementId: "G-HC0ZX4EJ81",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);

export const getMessageToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VALID_KEY,
    });
    return token;
  } catch (e) {
    console.log(e);
  }
};
