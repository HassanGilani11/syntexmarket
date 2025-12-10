
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useRealStockData } from '@/hooks/useRealStockData';
import { generatePriceHistory } from '@/utils/stocksApi';
import { StockCard } from '@/components/stocks/StockCard';
import { StockChart } from '@/components/stocks/StockChart';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Stocks = () => {
  const { stocks, loading, lastFetched, refetch } = useRealStockData(300000);
  const [selectedStock, setSelectedStock] = React.useState(stocks[0]);
  
  // Update selected stock when stocks change
  React.useEffect(() => {
    if (stocks.length > 0 && !stocks.find(s => s.symbol === selectedStock?.symbol)) {
      setSelectedStock(stocks[0]);
    }
  }, [stocks, selectedStock?.symbol]);
  
  const stocksWithHistory = stocks.map(stock => {
    return {
      ...stock,
      priceHistory: generatePriceHistory(30, stock.price, 2)
    };
  });
  
  return (
    <PageLayout title="Stocks">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastFetched.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Prices
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">All Stocks</h2>
          <div className="space-y-4">
            {stocksWithHistory.map((stock) => (
              <StockCard 
                key={stock.symbol} 
                stock={stock} 
                priceHistory={stock.priceHistory}
                onClick={() => setSelectedStock(stock)}
                className={selectedStock?.symbol === stock.symbol ? "ring-2 ring-primary" : ""}
              />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          {selectedStock && (
            <>
              <StockChart 
                symbol={selectedStock.symbol} 
                name={selectedStock.name} 
                currentPrice={selectedStock.price}
                volatility={2.5}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-card rounded-lg p-4 shadow">
                  <h3 className="font-medium text-sm text-muted-foreground">Market Cap</h3>
                  <p className="text-xl font-semibold mt-1">
                    ${(selectedStock.marketCap / 1000000000).toFixed(2)}B
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow">
                  <h3 className="font-medium text-sm text-muted-foreground">Volume</h3>
                  <p className="text-xl font-semibold mt-1">
                    {(selectedStock.volume / 1000000).toFixed(2)}M
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 shadow">
                  <h3 className="font-medium text-sm text-muted-foreground">52W Range</h3>
                  <p className="text-xl font-semibold mt-1">
                    ${(selectedStock.price * 0.8).toFixed(2)} - ${(selectedStock.price * 1.2).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Stocks;
