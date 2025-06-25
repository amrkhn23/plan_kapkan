import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const STORAGE_SUPPLEMENTS = 'supplements';
const STORAGE_CHECKS = 'supplement-checks';
const today = new Date();
const daysToShow = 90;

export default function App() {
  const [supplements, setSupplements] = useState([]);
  const [checked, setChecked] = useState({});

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
        { name: '5-HTP', daily: true, dose: '1 капсула (50 мг)', cycle: [30, 14], optional: true, timing: 'За 30–60 мин до сна' },
      ];
      setSupplements(defaultSupplements);
      localStorage.setItem(STORAGE_SUPPLEMENTS, JSON.stringify(defaultSupplements));
    }

    const savedChecks = localStorage.getItem(STORAGE_CHECKS);
    if (savedChecks) setChecked(JSON.parse(savedChecks));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_CHECKS, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    if (Notification.permission !== 'granted') Notification.requestPermission();

    const now = new Date();
    const millisTill20 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0) - now;
    const timer = setTimeout(() => {
      const dateKey = new Date().toISOString().split('T')[0];
      const missed = supplements.some(s => !checked[`${dateKey}-${s.name}`]);
      if (missed && Notification.permission === 'granted') {
        new Notification('Напоминание', { body: 'Вы не отметили все добавки за сегодня.' });
      }
    }, millisTill20 > 0 ? millisTill20 : 0);
    return () => clearTimeout(timer);
  }, [checked, supplements]);

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
    return Array.from({ length: daysToShow }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const getTotalTaken = (name) => {
    return Object.keys(checked).filter(key => key.endsWith(`-${name}`) && checked[key]).length;
  };

  const supplementStats = supplements.map(s => ({
    name: s.name,
    count: getTotalTaken(s.name)
  }));

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

      <BarChart width={500} height={250} data={supplementStats} style={{ marginTop: '2rem' }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>

      <hr style={{ margin: '1rem 0' }} />
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
