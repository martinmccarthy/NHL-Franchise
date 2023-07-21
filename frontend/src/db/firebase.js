// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "hockeymanager-752bc.firebaseapp.com",
  projectId: "hockeymanager-752bc",
  storageBucket: "hockeymanager-752bc.appspot.com",
  messagingSenderId: "27731677283",
  appId: "1:27731677283:web:c4c07df6b2b93486f2e856",
  measurementId: "G-TS7739C8DL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth();