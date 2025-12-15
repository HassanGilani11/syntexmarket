import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUpIcon, Loader2Icon } from 'lucide-react';
import { Cryptocurrency, formatNumber } from '@/utils/stocksApi';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { cn } from '@/lib/utils';

interface CryptoChartProps {
  cryptos: Cryptocurrency[];
  className?: string;
}

const timeRanges = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export function CryptoChart({ cryptos, className }: CryptoChartProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const { prices, loading, error, fetchHistory } = useCryptoHistory();

  useEffect(() => {
    if (selectedCrypto) {
      fetchHistory(selectedCrypto, selectedDays);
    }
  }, [selectedCrypto, selectedDays, fetchHistory]);

  const crypto = cryptos.find(c => c.symbol === selectedCrypto);

  const chartData = prices.map(p => ({
    date: new Date(p.timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: selectedDays === 1 ? 'numeric' : undefined,
    }),
    price: p.price,
    fullDate: new Date(p.timestamp).toLocaleString(),
  }));

  const minPrice = Math.min(...prices.map(p => p.price));
  const maxPrice = Math.max(...prices.map(p => p.price));
  const priceChange = prices.length > 1 ? prices[prices.length - 1].price - prices[0].price : 0;
  const priceChangePercent = prices.length > 1 ? (priceChange / prices[0].price) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2" />
            Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cryptos.map(c => (
                  <SelectItem key={c.symbol} value={c.symbol}>
                    {c.symbol} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-md border overflow-hidden">
              {timeRanges.map(range => (
                <Button
                  key={range.days}
                  variant={selectedDays === range.days ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none px-3"
                  onClick={() => setSelectedDays(range.days)}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Price summary */}
        {crypto && (
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-bold">
              ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {prices.length > 1 && (
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-danger"
              )}>
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}% ({selectedDays === 1 ? '24h' : `${selectedDays}d`})
              </span>
            )}
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Failed to load chart data
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[minPrice * 0.99, maxPrice * 1.01]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(value < 1 ? 4 : 0)}`}
                  className="text-muted-foreground"
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: value < 1 ? 6 : 2 })}`,
                    'Price'
                  ]}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--danger))"}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>

        {/* Stats */}
        {prices.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Low</div>
              <div className="font-medium">${minPrice.toLocaleString('en-US', { maximumFractionDigits: minPrice < 1 ? 4 : 2 })}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">High</div>
              <div className="font-medium">${maxPrice.toLocaleString('en-US', { maximumFractionDigits: maxPrice < 1 ? 4 : 2 })}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="font-medium">{crypto ? formatNumber(crypto.marketCap) : '-'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
