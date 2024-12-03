// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD73ic9NsVP5CwkEwVbirtpWqru7ZMWWl4",
  authDomain:  "rice-plant-disease-detec-51b85.firebaseapp.com",
  projectId: "rice-plant-disease-detec-51b85",
  storageBucket: "rice-plant-disease-detec-51b85.firebasestorage.app",
  messagingSenderId: "339781934814",
  appId: "1:339781934814:web:57dc6c827a336c6101ac4f",
  measurementId: "G-DVBGEG6L12"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
