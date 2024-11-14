import React from 'react';

const BotaoRd = () => {
  const handleRedirect = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <button onClick={handleRedirect}>
      Ir para o Google
    </button>
  );
};

export default BotaoRd;