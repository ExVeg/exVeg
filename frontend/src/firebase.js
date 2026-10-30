import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDffh5ZeXxA9oZz9o_oQKMFnYCy0wvujTo",
  authDomain: "exveg-commercial.firebaseapp.com",
  projectId: "exveg-commercial",
  storageBucket: "exveg-commercial.firebasestorage.app",
  messagingSenderId: "501803746230",
  appId: "1:501803746230:web:19f772481196cee7fbf717",
  measurementId: "G-ECHPXJVY62"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
