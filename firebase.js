import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAcUwm5sE7u3AvhZnSuTQ7C1yZ18Zaf104",
  authDomain: "myplankapkan.firebaseapp.com",
  projectId: "myplankapkan",
  storageBucket: "myplankapkan.firebasestorage.app",
  messagingSenderId: "1068143371510",
  appId: "1:1068143371510:web:427c51d4eecd59882c78d7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
