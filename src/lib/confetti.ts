import confetti from 'canvas-confetti';

export const celebrateTaskComplete = () => {
  const colors = ['#f472b6', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399'];
  
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors,
  });
};

export const celebrateBigWin = () => {
  const duration = 2000;
  const colors = ['#f472b6', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399'];

  const interval = setInterval(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 150);

  setTimeout(() => clearInterval(interval), duration);
};
