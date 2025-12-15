import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

const defaultRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  CHF: 0.90,
  AUD: 1.53,
  CNY: 7.24,
  INR: 83.12,
  MXN: 17.15,
};

export function useForexRates(refreshInterval = 300000) {
  const [rates, setRates] = useState<Record<string, number>>(defaultRates);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching live forex rates...');
      
      const { data, error: fnError } = await supabase.functions.invoke<ExchangeRates>('fetch-forex');
      
      if (fnError) {
        console.error('Error calling fetch-forex function:', fnError);
        throw fnError;
      }

      if (data?.rates) {
        setRates(data.rates);
        setLastFetched(new Date(data.lastUpdated));
        console.log('Updated forex rates');
      }
    } catch (err) {
      console.error('Failed to fetch forex rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch forex rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    const intervalId = setInterval(fetchRates, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchRates, refreshInterval]);

  const convert = useCallback((amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }, [rates]);

  return { rates, loading, lastFetched, error, refetch: fetchRates, convert };
}
