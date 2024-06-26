import React from 'react';
import './raffle.css';

const generateConfettiStyles = () => {
  const confettiColors = ['#f2b632', '#f28b30', '#e94560', '#9b5de5', '#00bbf9', '#00f5d4'];
  return [...Array(100)].map((_, i) => ({
    '--confetti-color': confettiColors[Math.floor(Math.random() * confettiColors.length)],
    '--confetti-left': `${Math.random() * 100}%`,
    '--confetti-rotate': `${Math.random() * 360}deg`,
    '--confetti-duration': `${Math.random() * 2 + 3}s`,
  }));
};

const WinnerModal = ({ winner, onClose }) => {
  const confettiStyles = generateConfettiStyles();

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Congratulations!</h2>
        <p>The winner is <strong>{winner}</strong>!</p>
        <button onClick={onClose}>Reset Raffle</button>
      </div>
      {confettiStyles.map((style, i) => (
        <div key={i} className="confetti" style={style}></div>
      ))}
    </div>
  );
};

export default WinnerModal;
