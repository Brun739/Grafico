import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Carregar lista de moedas e taxas de câmbio na montagem do componente
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`); // Altere para uma chave válida de API, se necessário
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Erro ao carregar dados da API');
        }

        // Extrair as moedas disponíveis das taxas de câmbio
        setCurrencies(Object.keys(data.rates));
      } catch (err) {
        setError('Erro ao carregar dados da API. Tente novamente mais tarde.');
      }
    };

    fetchCurrencies();
  }, []);

  const handleConvert = async () => {
    setError('');
    setResult(null);

    if (fromCurrency === toCurrency) {
      setResult(amount);
      return;
    }

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao obter taxas de câmbio');
      }

      const rate = data.rates[toCurrency];
      if (!rate) throw new Error("Taxa de conversão não encontrada.");

      setResult(amount * rate);
    } catch (err) {
      setError('Erro ao obter taxas de câmbio. Verifique a conexão e tente novamente.');
    }
  };

  return (
    <div className="app-container">
      <h1>Conversão de Moedas</h1>
      <div className="currency-form">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Valor"
        />
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          {currencies.map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <button className="convert-button" onClick={handleConvert}>Converter</button>
      </div>
      {result !== null && (
        <p>Resultado: {result.toFixed(2)} {toCurrency}</p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App;
