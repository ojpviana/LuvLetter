import React, { useEffect, useState } from 'react';

export default function FloatingHearts({ count = 20, opacityBase = 0.4 }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const newHearts = Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const animationDuration = 8 + Math.random() * 12;
      const animationDelay = -(Math.random() * 20);
      const size = 1.2 + Math.random() * 1.5;
      const opacity = opacityBase + Math.random() * (1 - opacityBase);
      return { id: i, left, animationDuration, animationDelay, size, opacity };
    });
    setHearts(newHearts);
  }, [count, opacityBase]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute bottom-[-5%] text-pink-500 animate-float-heart-fixed drop-shadow-md"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}rem`,
            '--heart-opacity': h.opacity,
            animationDuration: `${h.animationDuration}s`,
            animationDelay: `${h.animationDelay}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
