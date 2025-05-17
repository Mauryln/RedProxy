// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLgrdPzhAosfxJO-mBZSNKxrnO5ddZ1hQ",
  authDomain: "proyectobimcat.firebaseapp.com",
  databaseURL: "https://proyectobimcat-default-rtdb.firebaseio.com",
  projectId: "proyectobimcat",
  storageBucket: "proyectobimcat.firebasestorage.app",
  messagingSenderId: "863631991587",
  appId: "1:863631991587:web:1451777862576bcacba296"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);