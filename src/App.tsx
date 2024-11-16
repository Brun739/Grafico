import React, { useEffect, useState } from 'react';
import './App.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]); // Histórico para o gráfico
  const [period, setPeriod] = useState('1M'); // Período selecionado

  // Carregar lista de moedas
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error('Erro ao carregar lista de moedas');
        }

        setCurrencies(Object.keys(data.rates));
      } catch (err) {
        setError('Erro ao carregar lista de moedas. Tente novamente mais tarde.');
      }
    };

    fetchCurrencies();
  }, []);

  // Gerar histórico com base no período
  const generateHistory = (days: number) => {
    const today = new Date();
    const historyData = Array.from({ length: days }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const rate = 5 + Math.random() * 0.5 - 0.25; // Simula variações em torno de 5
      return { date: date.toISOString().split('T')[0], rate };
    });

    setHistory(historyData.reverse());
  };

  // Atualizar histórico ao mudar período ou moedas
  useEffect(() => {
    const periodMapping: { [key: string]: number } = {
      '5Y': 5 * 365,
      '1Y': 365,
      '5M': 5 * 30,
      '1M': 30,
      '3W': 21,
      '1W': 7,
      '48H': 2,
    };

    generateHistory(periodMapping[period]);
  }, [fromCurrency, toCurrency, period]);

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
        throw new Error('Erro ao obter taxa de câmbio');
      }

      const rate = data.rates[toCurrency];
      if (!rate) throw new Error('Taxa de conversão não encontrada.');

      setResult(amount * rate);
    } catch (err) {
      setError('Erro ao obter taxas de câmbio.');
    }
  };

  // Dados para o gráfico
  const chartData = {
    labels: history.map((entry) => entry.date),
    datasets: [
      {
        label: `Taxa de ${fromCurrency} para ${toCurrency}`,
        data: history.map((entry) => entry.rate),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
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
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <button className="convert-button" onClick={handleConvert}>
          Converter
        </button>
      </div>
      {result !== null && (
        <p>
          Resultado: {result.toFixed(2)} {toCurrency}
        </p>
      )}
      {error && <p className="error-message">{error}</p>}

      {/* Seleção de período */}
      <div className="period-selector">
        <label>Período: </label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="5Y">5 Anos</option>
          <option value="1Y">1 Ano</option>
          <option value="5M">5 Meses</option>
          <option value="1M">1 Mês</option>
          <option value="3W">3 Semanas</option>
          <option value="1W">1 Semana</option>
          <option value="48H">48 Horas</option>
        </select>
      </div>

      {/* Gráfico de histórico */}
      <div className="chart-container">
        <h2>Histórico de Taxas</h2>
        {history.length > 0 ? (
          <Line data={chartData} options={{ responsive: true }} />
        ) : (
          <p>Carregando gráfico...</p>
        )}
      </div>
    </div>
  );
}

export default App;
