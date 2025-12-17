
import React, { useState } from 'react';
import { 
  useMarketIndices, useCurrencyPairs, 
  mockIndices, mockCurrencies, mockNews,
  generatePriceHistory 
} from '@/utils/stocksApi';
import { useRealStockData } from '@/hooks/useRealStockData';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { MarketOverview } from '@/components/markets/MarketOverview';
import { CurrencyExchange } from '@/components/currencies/CurrencyExchange';
import { NewsCard } from '@/components/news/NewsCard';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, TrendingDown, TrendingUp, Wallet2 } from 'lucide-react';

export function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  
  // Use real stock data hook
  const { stocks, loading, lastFetched, refetch } = useRealStockData(300000); // Refresh every 5 min
  
  // Get selected stock from current stocks data
  const selectedStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];
  
  // Use our hooks to get real-time mock data for indices/currencies
  const indices = useMarketIndices(mockIndices);
  const currencies = useCurrencyPairs(mockCurrencies);
  
  // Generate chart data for the selected stock
  const selectedStockHistory = generatePriceHistory(30, selectedStock.price, 2);
  
  // Generate chart data for stock cards
  const stocksWithHistory = stocks.map(stock => {
    return {
      ...stock,
      priceHistory: generatePriceHistory(30, stock.price, 2)
    };
  });
  
  // Calculate market statistics
  const gainers = stocks.filter(stock => stock.changePercent > 0);
  const losers = stocks.filter(stock => stock.changePercent < 0);
  
  const topGainer = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
  
  const totalMarketCap = stocks.reduce((sum, stock) => sum + stock.marketCap, 0);
  const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
        
        <main className="flex-1 transition-all duration-300 overflow-x-hidden">
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Market Dashboard</h1>
              <div className="flex items-center gap-2">
                {lastFetched && (
                  <span className="text-xs text-muted-foreground">
                    Updated: {lastFetched.toLocaleTimeString()}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ '--delay': '100ms' } as React.CSSProperties}>
              <StatsCard 
                title="Market Cap" 
                value="$13.42T"
                trend={0.47}
                icon={<Wallet2 />}
                className="bg-primary/5"
              />
              <StatsCard 
                title="Trading Volume" 
                value="487.32M"
                description="Today's volume"
                icon={<BarChart3 />}
                className="bg-primary/5"
              />
              <StatsCard 
                title="Top Gainer" 
                value={topGainer?.symbol || 'N/A'}
                trend={topGainer?.changePercent || 0}
                trendLabel={topGainer?.name || ''}
                icon={<TrendingUp />}
                className="bg-success/5"
              />
              <StatsCard 
                title="Top Loser" 
                value={topLoser?.symbol || 'N/A'}
                trend={topLoser?.changePercent || 0}
                trendLabel={topLoser?.name || ''}
                icon={<TrendingDown />}
                className="bg-danger/5"
              />
            </div>
            
            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left column - Stock list */}
              <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
                <h2 className="text-xl font-semibold">Watchlist</h2>
                <div className="space-y-4">
                  {stocksWithHistory.slice(0, 5).map((stock) => (
                    <StockCard 
                      key={stock.symbol} 
                      stock={stock} 
                      priceHistory={stock.priceHistory}
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={selectedSymbol === stock.symbol ? "ring-2 ring-primary" : ""}
                    />
                  ))}
                </div>
              </div>
              
              {/* Middle column - Chart and news */}
              <div className="lg:col-span-2 space-y-4 animate-slide-up" style={{ '--delay': '300ms' } as React.CSSProperties}>
                <StockChart 
                  symbol={selectedStock.symbol} 
                  name={selectedStock.name} 
                  currentPrice={selectedStock.price}
                  volatility={2.5}
                />
                <NewsCard news={mockNews} className="mt-6" />
              </div>
              
              {/* Right column - Markets and currencies */}
              <div className="lg:col-span-1 space-y-4 animate-slide-up" style={{ '--delay': '400ms' } as React.CSSProperties}>
                <MarketOverview indices={indices} />
                <CurrencyExchange currencies={currencies} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
