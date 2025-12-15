import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CurrencyExchange } from '@/components/currencies/CurrencyExchange';
import { CryptoList } from '@/components/currencies/CryptoList';
import { PriceAlertDialog } from '@/components/currencies/PriceAlertDialog';
import { useCurrencyPairs, mockCurrencies } from '@/utils/stocksApi';
import { useRealCryptoData } from '@/hooks/useRealCryptoData';
import { useForexRates } from '@/hooks/useForexRates';
import { useCryptoAlerts } from '@/hooks/useCryptoAlerts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/stocksApi';

const currencyOptions = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
];

const Currencies = () => {
  const currencies = useCurrencyPairs(mockCurrencies);
  const { cryptos, loading: cryptoLoading, lastFetched: cryptoLastFetched, refetch: refetchCrypto } = useRealCryptoData(60000);
  const { rates, loading: forexLoading, lastFetched: forexLastFetched, refetch: refetchForex, convert } = useForexRates(300000);
  const { alerts, addAlert, removeAlert, clearTriggeredAlerts } = useCryptoAlerts(cryptos);
  
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState('0');

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const result = convert(numAmount, fromCurrency, toCurrency);
    setConvertedAmount(result.toFixed(2));
  }, [amount, fromCurrency, toCurrency, convert]);

  const getSymbol = (code: string) => currencyOptions.find(c => c.code === code)?.symbol || '';

  return (
    <PageLayout title="Currency Exchange">
      <div className="flex justify-end mb-4">
        <PriceAlertDialog
          cryptos={cryptos}
          alerts={alerts}
          onAddAlert={addAlert}
          onRemoveAlert={removeAlert}
          onClearTriggered={clearTriggeredAlerts}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrencyExchange currencies={currencies} />
        <CryptoList 
          cryptos={cryptos} 
          loading={cryptoLoading} 
          lastFetched={cryptoLastFetched}
          onRefresh={refetchCrypto}
        />
      </div>
      
      <div className="bg-card rounded-lg p-6 shadow mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Currency Converter</h2>
          <div className="flex items-center gap-2">
            {forexLastFetched && (
              <span className="text-xs text-muted-foreground">
                Rates updated: {formatDate(forexLastFetched)}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refetchForex}
              disabled={forexLoading}
            >
              <RefreshCwIcon className={cn("h-4 w-4", forexLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="from-currency">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
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
                  {currencyOptions.map(currency => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="converted">Converted Amount</Label>
              <div className="w-full px-3 py-2 border rounded-md bg-muted font-medium">
                {getSymbol(toCurrency)}{parseFloat(convertedAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          1 {fromCurrency} = {convert(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
        </div>
      </div>
    </PageLayout>
  );
};

export default Currencies;
