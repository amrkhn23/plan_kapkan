import React, { useEffect, useState } from 'react';

const STORAGE_SUPPLEMENTS = 'supplements';
const STORAGE_CHECKS = 'supplement-checks';
const STORAGE_NOTIFY_TIME = 'supplement-notify-time';
const today = new Date();

export default function App() {
  const [supplements, setSupplements] = useState([]);
  const [checked, setChecked] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [notifyTime, setNotifyTime] = useState('20:00');

  useEffect(() => {
    const savedSupplements = localStorage.getItem(STORAGE_SUPPLEMENTS);
    if (savedSupplements) {
      setSupplements(JSON.parse(savedSupplements));
    } else {
      const defaultSupplements = [
        { name: 'Гейнер', daily: true, dose: '1 порция', timing: 'После тренировки' },
        { name: 'Креатин', daily: true, dose: '3–5 г (2–4 капсулы)', cycle: [60, 30], timing: 'После тренировки' },
        { name: 'Казеин', daily: true, dose: '1 порция (30 г)', timing: 'Перед сном' },
        { name: 'Глютамин', daily: true, dose: '5 г', timing: 'Перед сном' },
        { name: 'Витамины', daily: true, dose: '1 таблетка', cycle: [60, 30], timing: 'После обеда' },
        {
          name: 'Инозитол (B8)',
          daily: true,
          dose: '1 капсула (500 мг)',
          cycle: [30, 14],
          optional: true,
          timing: 'Утром или перед сном'
        },
      ];
      setSupplements(defaultSupplements);
      localStorage.setItem(STORAGE_SUPPLEMENTS, JSON.stringify(defaultSupplements));
    }

    const savedChecks = localStorage.getItem(STORAGE_CHECKS);
    if (savedChecks) setChecked(JSON.parse(savedChecks));

    const savedTime = localStorage.getItem(STORAGE_NOTIFY_TIME);
    if (savedTime) setNotifyTime(savedTime);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_CHECKS, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(STORAGE_NOTIFY_TIME, notifyTime);
  }, [notifyTime]);

  useEffect(() => {
    if (Notification.permission !== 'granted') Notification.requestPermission();

    const [hours, minutes] = notifyTime.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    const millisTillNotify = target - now;

    const timer = setTimeout(() => {
      const dateKey = new Date().toISOString().split('T')[0];
      const missedSupplements = supplements.filter(s => !checked[`${dateKey}-${s.name}`]);

      if (missedSupplements.length && Notification.permission === 'granted') {
        missedSupplements.forEach(s => {
          new Notification('Напоминание', {
            body: `${s.name}: ${s.dose} (${s.timing})`,
          });
        });
      }
    }, millisTillNotify > 0 ? millisTillNotify : 0);

    return () => clearTimeout(timer);
  }, [checked, supplements, notifyTime]);

  const handleToggle = (date, name) => {
    const key = `${date}-${name}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteSupplement = (name) => {
    const updated = supplements.filter(s => s.name !== name);
    setSupplements(updated);
    localStorage.setItem(STORAGE_SUPPLEMENTS, JSON.stringify(updated));
  };

  const handleAddSupplement = (e) => {
    e.preventDefault();
    const form = e.target;
    const newSupplement = {
      name: form.name.value,
      dose: form.dose.value,
      timing: form.timing.value,
      daily: true
    };
    const updated = [...supplements, newSupplement];
    setSupplements(updated);
    localStorage.setItem(STORAGE_SUPPLEMENTS, JSON.stringify(updated));
    form.reset();
  };

  const getVisibleDays = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + weekOffset * 7);
      return d.toISOString().split('T')[0];
    });
  };

  const getTotalTaken = (name) => {
    return Object.keys(checked).filter(key => key.endsWith(`-${name}`) && checked[key]).length;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Итого по добавкам:</h2>
      {supplements.map(s => (
        <div key={s.name} style={{ fontSize: '0.9rem' }}>
          {s.name}: <strong>{getTotalTaken(s.name)}</strong> дней приёма
          <button onClick={() => handleDeleteSupplement(s.name)} style={{ marginLeft: '1rem' }}>🗑️</button>
        </div>
      ))}

      <form onSubmit={handleAddSupplement} style={{ marginTop: '1rem' }}>
        <input name="name" placeholder="Название" required />
        <input name="dose" placeholder="Дозировка" required />
        <input name="timing" placeholder="Время" required />
        <button type="submit">Добавить</button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <label>⏰ Время напоминания:</label>{' '}
        <input
          type="time"
          value={notifyTime}
          onChange={(e) => setNotifyTime(e.target.value)}
        />
      </div>

      <hr style={{ margin: '1rem 0' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)}>← Пред. неделя</button>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>След. неделя →</button>
      </div>

      {getVisibleDays().map(date => (
        <div key={date} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>{new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
          {supplements.map(s => {
            const startDate = today;
            const dayIndex = Math.floor((new Date(date) - startDate) / (1000 * 60 * 60 * 24));
            let visible = true;
            if (s.cycle) {
              const [onDays, offDays] = s.cycle;
              const cycleLength = onDays + offDays;
              visible = (dayIndex % cycleLength) < onDays;
            }
            if (s.interval) {
              visible = dayIndex % s.interval === 0;
            }
            return visible ? (
              <div key={s.name} style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={checked[`${date}-${s.name}`] || false}
                    onChange={() => handleToggle(date, s.name)}
                  />
                  {s.name} — <em>{s.dose}</em>
                </label>
                <div style={{ fontSize: '0.75rem', color: '#666', marginLeft: '1.5rem' }}>{s.timing}</div>
              </div>
            ) : null;
          })}
        </div>
      ))}
    </div>
  );
}
