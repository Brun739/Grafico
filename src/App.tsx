import React, { useState } from 'react';
import './App.css';

function App() {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConversion = async () => {
    try {
      setFeedbackMessage(null);
      setErrorMessage(null);
      
     //exmemplo de api 
      const response = await fetch('API_URL');
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Requisição inválida. Verifique os valores inseridos e tente novamente.");
        } else if (response.status === 404) {
          throw new Error("Serviço de conversão não encontrado. Tente novamente mais tarde.");
        } else if (response.status === 500) {
          throw new Error("Erro interno do servidor. Tente novamente em alguns minutos.");
        } else {
          throw new Error("Erro desconhecido. Verifique sua conexão e tente novamente.");
        }
      }

      const data = await response.json();

      if (!data || !data.convertedValue) {
        throw new Error("Erro na conversão. Verifique os valores de moeda e tente novamente.");
      }

      
      setFeedbackMessage(`Conversão realizada com sucesso! Valor: ${data.convertedValue}`);
      setErrorMessage(null);
    } catch (error: any) {

      setErrorMessage(error.message || 'Erro ao tentar converter moeda.');
    }
  };

  return (
    <div className="App">
      <h1>Conversor de Moedas</h1>
      <button onClick={handleConversion}>Converter</button>

      {feedbackMessage && <div className="feedback">{feedbackMessage}</div>}
      {errorMessage && <div className="error">{errorMessage}</div>}
    </div>
  );
}

export default App;
