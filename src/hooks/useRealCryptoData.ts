import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cryptocurrency, mockCryptos } from '@/utils/stocksApi';

interface FetchCryptoResponse {
  cryptos: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number;
    volume: number;
    supply: number;
    lastUpdated: string;
  }[];
  fetchedAt: string;
}

export function useRealCryptoData(refreshInterval = 60000) {
  const [cryptos, setCryptos] = useState<Cryptocurrency[]>(mockCryptos);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCryptos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching live crypto data...');
      
      const { data, error: fnError } = await supabase.functions.invoke<FetchCryptoResponse>('fetch-crypto');
      
      if (fnError) {
        console.error('Error calling fetch-crypto function:', fnError);
        throw fnError;
      }

      if (data?.cryptos && data.cryptos.length > 0) {
        const updatedCryptos: Cryptocurrency[] = data.cryptos.map(crypto => ({
          symbol: crypto.symbol,
          name: crypto.name,
          price: crypto.price,
          change: crypto.change,
          changePercent: crypto.changePercent,
          marketCap: crypto.marketCap,
          volume: crypto.volume,
          supply: crypto.supply,
          lastUpdated: new Date(crypto.lastUpdated)
        }));

        setCryptos(updatedCryptos);
        setLastFetched(new Date(data.fetchedAt));
        console.log(`Updated ${updatedCryptos.length} cryptocurrencies with live data`);
      }
    } catch (err) {
      console.error('Failed to fetch crypto data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch crypto data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptos();
    
    const intervalId = setInterval(fetchCryptos, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchCryptos, refreshInterval]);

  return { cryptos, loading, lastFetched, error, refetch: fetchCryptos };
}
