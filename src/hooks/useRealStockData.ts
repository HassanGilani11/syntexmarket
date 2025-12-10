import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Stock, mockStocks } from '@/utils/stocksApi';
import { toast } from 'sonner';

interface FetchStocksResponse {
  stocks: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    lastUpdated: string;
  }>;
  fetchedAt: string;
}

export function useRealStockData(refreshInterval = 300000) { // Default: refresh every 5 minutes
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching real stock data...');
      
      const { data, error: fetchError } = await supabase.functions.invoke<FetchStocksResponse>('fetch-stocks', {
        body: { symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'V', 'JPM', 'JNJ'] }
      });
      
      if (fetchError) {
        console.error('Error fetching stocks:', fetchError);
        setError(fetchError.message);
        toast.error('Failed to fetch real-time stock data. Using cached data.');
        return;
      }
      
      if (data?.stocks && data.stocks.length > 0) {
        const updatedStocks: Stock[] = data.stocks.map(s => ({
          symbol: s.symbol,
          name: s.name,
          price: s.price,
          change: s.change,
          changePercent: s.changePercent,
          volume: s.volume,
          marketCap: s.marketCap,
          lastUpdated: new Date(s.lastUpdated)
        }));
        
        // Merge with mock data for stocks that weren't fetched (due to API limits)
        const fetchedSymbols = new Set(updatedStocks.map(s => s.symbol));
        const remainingMockStocks = mockStocks
          .filter(s => !fetchedSymbols.has(s.symbol))
          .map(s => ({ ...s, lastUpdated: new Date() }));
        
        setStocks([...updatedStocks, ...remainingMockStocks]);
        setLastFetched(new Date(data.fetchedAt));
        toast.success(`Updated ${updatedStocks.length} stock prices`);
        console.log(`Fetched ${updatedStocks.length} real stock prices`);
      } else {
        console.log('No stock data received, using mock data');
        setError('API rate limit reached. Using cached data.');
        toast.info('API limit reached. Using cached prices.');
      }
    } catch (err) {
      console.error('Error in useRealStockData:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStocks();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchStocks, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [fetchStocks, refreshInterval]);

  return { stocks, loading, lastFetched, error, refetch: fetchStocks };
}
