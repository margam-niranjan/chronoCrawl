import React, { useEffect, useState } from 'react';

export default function Clock({ timeEffect }) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    let interval;
    const getSpeed = () => {
      switch (timeEffect) {
        case 'Slowed': return 2000;      // 1 sec every 2 real secs
        case 'Sped up': return 500;      // 2 secs every 1 real sec
        default: return 1000;            // Normal
      }
    };

    interval = setInterval(() => {
      setClock(prev => {
        const newTime = new Date(prev);
        if (timeEffect === 'Reverse') newTime.setSeconds(newTime.getSeconds() - 1);
        else if (timeEffect === 'Sped up') newTime.setSeconds(newTime.getSeconds() + 2);
        else newTime.setSeconds(newTime.getSeconds() + 1);
        return newTime;
      });
    }, getSpeed());

    return () => clearInterval(interval);
  }, [timeEffect]);

  return (
    <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
      ⏰ Distorted Clock: {clock.toLocaleTimeString()} ({timeEffect})
    </div>
  );
}
