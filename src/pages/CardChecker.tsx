import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Trash2, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { stripePromise } from '../config/stripe';
import Header from '../components/Header';

interface CheckResult {
  cardNumber: string;
  status: 'valid' | 'invalid' | 'error';
  message: string;
  timestamp: string;
  testAmount: number;
}

export default function CardChecker() {
  const { user } = useAuth();
  const [cardInput, setCardInput] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [testAmount, setTestAmount] = useState(100); // R$1,00
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!cardInput || !expiryMonth || !expiryYear || !cvv) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Erro ao carregar Stripe');
      }

      // Criar um token do cartão
      const { token, error: tokenError } = await stripe.createToken({
        number: cardInput.replace(/\s/g, ''),
        exp_month: parseInt(expiryMonth),
        exp_year: parseInt(expiryYear),
        cvc: cvv
      });

      if (tokenError) {
        throw new Error(tokenError.message);
      }

      // Simular uma pré-autorização com o valor de teste
      const response = await fetch('/api/check-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          amount: testAmount
        })
      });

      const data = await response.json();

      const result: CheckResult = {
        cardNumber: `**** **** **** ${cardInput.slice(-4)}`,
        status: data.success ? 'valid' : 'invalid',
        message: data.success ? 'Cartão válido' : data.error || 'Cartão inválido',
        timestamp: new Date().toLocaleString('pt-BR'),
        testAmount: testAmount
      };

      setResults(prev => [result, ...prev]);
      
      // Limpar campos após o teste
      setCardInput('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
    } catch (err) {
      const result: CheckResult = {
        cardNumber: `**** **** **** ${cardInput.slice(-4)}`,
        status: 'error',
        message: err instanceof Error ? err.message : 'Erro ao verificar cartão',
        timestamp: new Date().toLocaleString('pt-BR'),
        testAmount: testAmount
      };
      setResults(prev => [result, ...prev]);
    } finally {
      setIsChecking(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardInput(formatted.slice(0, 19));
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
      setExpiryMonth(value);
    }
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiryYear(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'valid': return 'text-green-600';
      case 'invalid': return 'text-red-600';
      case 'error': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center p-8">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <CreditCard className="w-8 h-8" />
                Verificador de Cartões
              </h1>
            </div>
            {results.length > 0 && (
              <button
                onClick={clearResults}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar Histórico
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Cartão
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={cardInput}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isChecking}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mês
                    </label>
                    <input
                      type="text"
                      value={expiryMonth}
                      onChange={handleExpiryMonthChange}
                      placeholder="MM"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isChecking}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano
                    </label>
                    <input
                      type="text"
                      value={expiryYear}
                      onChange={handleExpiryYearChange}
                      placeholder="AAAA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isChecking}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={handleCvvChange}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isChecking}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor do Teste (centavos)
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  min="1"
                  className="w-full md:w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isChecking}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Valor atual: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(testAmount / 100)}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCheck}
                  disabled={isChecking || !cardInput || !expiryMonth || !expiryYear || !cvv}
                  className={`px-6 py-3 rounded-lg text-white flex items-center gap-2 transition-colors ${
                    isChecking || !cardInput || !expiryMonth || !expiryYear || !cvv
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isChecking ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  Verificar
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-mono text-lg">{result.cardNumber}</div>
                        <div className="text-sm text-gray-500">{result.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getStatusColor(result.status)}`}>
                        {result.status === 'valid' ? 'Válido' : result.status === 'invalid' ? 'Inválido' : 'Erro'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valor testado: {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(result.testAmount / 100)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}