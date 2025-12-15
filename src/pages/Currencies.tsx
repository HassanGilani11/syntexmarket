import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CurrencyExchange } from '@/components/currencies/CurrencyExchange';
import { CryptoList } from '@/components/currencies/CryptoList';
import { useCurrencyPairs, mockCurrencies } from '@/utils/stocksApi';
import { useRealCryptoData } from '@/hooks/useRealCryptoData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Currencies = () => {
  const currencies = useCurrencyPairs(mockCurrencies);
  const { cryptos, loading, lastFetched, refetch } = useRealCryptoData(60000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState('0');

  // Exchange rates (simplified - in a real app, these would come from an API)
  const exchangeRates: { [key: string]: { [key: string]: number } } = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 149.50, USD: 1 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 162.50, EUR: 1 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 189.00, GBP: 1 },
    JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, JPY: 1 }
  };

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    const result = numAmount * rate;
    setConvertedAmount(result.toFixed(2));
  }, [amount, fromCurrency, toCurrency]);

  const formatCurrency = (value: string, currencyCode: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };
    return `${symbols[currencyCode] || ''}${value}`;
  };

  return (
    <PageLayout title="Currency Exchange">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrencyExchange currencies={currencies} />
        <CryptoList 
          cryptos={cryptos} 
          loading={loading} 
          lastFetched={lastFetched}
          onRefresh={refetch}
        />
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Currency Converter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="from-currency">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input 
                id="amount"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to-currency">To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="converted">Converted Amount</Label>
              <div className="w-full px-3 py-2 border rounded-md bg-muted">
                {formatCurrency(convertedAmount, toCurrency)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Currencies;
