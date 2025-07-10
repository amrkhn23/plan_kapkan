import React, { useEffect } from 'react';
import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';

const VAPID_KEY = 'BAOFF_ArOZ3FNQauZBkptJ57Un93nWPMHoXKGzusYHK3cOUp8fzsCk2o0-hvs8EZ9kqBKObelBRTTwFV4DnFPDo';

export default function App() {
  useEffect(() => {
    // Запрос разрешения на уведомления
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          subscribeToPush();
        } else {
          console.warn('❌ Notification permission denied');
        }
      });
    } else {
      subscribeToPush();
    }

    function subscribeToPush() {
      getToken(messaging, { vapidKey: VAPID_KEY })
        .then(currentToken => {
          if (currentToken) {
            console.log('📲 PUSH TOKEN:', currentToken);
            // Здесь можно отправить токен на сервер
          } else {
            console.warn('⚠️ Не удалось получить токен');
          }
        })
        .catch(err => {
          console.error('Ошибка при получении токена:', err);
        });
    }
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>💊 Supplement Tracker + Push</h1>
      <p>Это минимальный интерфейс с включённой логикой для push-уведомлений через Firebase.</p>
      <p>Добавь остальной функционал (график, добавки, чекбоксы и т.п.) как в основной версии.</p>
    </div>
  );
}
