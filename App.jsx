import React from 'react';
import { useEffect, useState } from 'react';

const supplements = [
  { name: 'Гейнер', daily: true, dose: '1 порция', timing: 'После тренировки' },
  { name: 'Креатин', daily: true, dose: '3–5 г (2–4 капсулы)', cycle: [60, 30], timing: 'После тренировки' },
  { name: 'Казеин', daily: true, dose: '1 порция (30 г)', timing: 'Перед сном' },
  { name: 'Глютамин', daily: true, dose: '5 г', timing: 'Перед сном' },
  { name: 'Витамины', daily: true, dose: '1 таблетка', cycle: [60, 30], timing: 'После обеда' },
  { name: '5-HTP', daily: true, dose: '1 капсула (50 мг)', cycle: [30, 14], optional: true, timing: 'За 30–60 мин до сна' },
];

const today = new Date();
const daysToShow = 90;
const STORAGE_KEY = 'supplement-checks';

export default function App() {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setChecked(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const handleToggle = (date, name) => {
    const key = `${date}-${name}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
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

  const getCycleStatus = (s) => {
    if (!s.cycle) return null;
    const [onDays, offDays] = s.cycle;
    const cycleLength = onDays + offDays;
    const cyclePosition = 0 % cycleLength;
    return cyclePosition < onDays ? `Приём (до ${onDays - cyclePosition} дн.)` : `Перерыв (ещё ${cycleLength - cyclePosition} дн.)`;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Итого по добавкам:</h2>
      {supplements.map(s => (
        <div key={s.name} style={{ fontSize: '0.9rem' }}>
          {s.name}: <strong>{getTotalTaken(s.name)}</strong> дней приёма {getCycleStatus(s) && `(сейчас: ${getCycleStatus(s)})`}
        </div>
      ))}
      <hr style={{ margin: '1rem 0' }} />
      {getVisibleDays().map(date => (
        <div key={date} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
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
