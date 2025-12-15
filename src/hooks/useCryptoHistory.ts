import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricePoint {
  timestamp: number;
  date: string;
  price: number;
}

export interface VolumePoint {
  timestamp: number;
  date: string;
  volume: number;
}

interface HistoryResponse {
  symbol: string;
  prices: PricePoint[];
  volumes: VolumePoint[];
  fetchedAt: string;
}

export function useCryptoHistory() {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [volumes, setVolumes] = useState<VolumePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState<string>('BTC');

  const fetchHistory = useCallback(async (symbol: string, days: number = 7) => {
    setLoading(true);
    setError(null);
    setCurrentSymbol(symbol);
    
    try {
      console.log(`Fetching ${days} days history for ${symbol}...`);
      
      const { data, error: fnError } = await supabase.functions.invoke<HistoryResponse>('fetch-crypto-history', {
        body: { symbol, days }
      });
      
      if (fnError) {
        console.error('Error calling fetch-crypto-history:', fnError);
        throw fnError;
      }

      if (data?.prices) {
        setPrices(data.prices);
        setVolumes(data.volumes || []);
        console.log(`Loaded ${data.prices.length} price points for ${symbol}`);
      }
    } catch (err) {
      console.error('Failed to fetch crypto history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  return { prices, volumes, loading, error, currentSymbol, fetchHistory };
}
