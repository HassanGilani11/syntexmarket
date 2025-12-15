import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, BitcoinIcon, RefreshCwIcon } from 'lucide-react';
import { Cryptocurrency, formatNumber, formatDate } from '@/utils/stocksApi';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CryptoListProps {
  cryptos: Cryptocurrency[];
  loading?: boolean;
  lastFetched?: Date | null;
  onRefresh?: () => void;
  className?: string;
}

export function CryptoList({ cryptos, loading, lastFetched, onRefresh, className }: CryptoListProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BitcoinIcon className="h-5 w-5 mr-2" />
            Cryptocurrency Prices
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className="text-xs text-muted-foreground">
                Updated: {formatDate(lastFetched)}
              </span>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCwIcon className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {cryptos.map((crypto) => (
            <div 
              key={crypto.symbol}
              className="flex items-center justify-between p-3 rounded-md bg-secondary/40 hover:bg-secondary/60 transition-colors"
            >
              <div className="flex items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-3 text-sm">
                  {crypto.symbol}
                </div>
                <div>
                  <div className="font-medium">{crypto.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Vol: {formatNumber(crypto.volume)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">
                  ${crypto.price < 1 ? crypto.price.toFixed(4) : crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn(
                  "flex items-center text-xs justify-end",
                  crypto.changePercent >= 0 ? "text-success" : "text-danger"
                )}>
                  {crypto.changePercent >= 0 ? 
                    <ArrowUpIcon className="h-3 w-3 mr-1" /> : 
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  }
                  {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
