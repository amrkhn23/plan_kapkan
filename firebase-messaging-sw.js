/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAcUwm5sE7u3AvhZnSuTQ7C1yZ18Zaf104",
  authDomain: "myplankapkan.firebaseapp.com",
  projectId: "myplankapkan",
  messagingSenderId: "1068143371510",
  appId: "1:1068143371510:web:427c51d4eecd59882c78d7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon.png'
  });
});
