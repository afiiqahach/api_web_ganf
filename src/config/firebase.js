require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');
const { getStorage } = require('firebase/storage');

const {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} = process.env;

const firebaseConfig = {
  apiKey: "AIzaSyCFVZtuqGUsfdm-avsAl2U89QoMArE5RPE",
  authDomain: "ganf-backend.firebaseapp.com",
  projectId: "ganf-backend",
  storageBucket: "ganf-backend.appspot.com",
  messagingSenderId: "790762277120",
  appId: "1:790762277120:web:7a698760ea819050958be5",
  measurementId: "G-ND1PV55D6R"
};
const app = initializeApp(firebaseConfig);

// Get services
const auth = getAuth(app);
const database = getFirestore(app);
const storage = getStorage(app);

module.exports = {
  auth,
  database,
  storage,
};
