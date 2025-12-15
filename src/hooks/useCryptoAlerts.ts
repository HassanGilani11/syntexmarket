import { useState, useEffect, useCallback } from 'react';
import { Cryptocurrency } from '@/utils/stocksApi';
import { toast } from 'sonner';

export interface CryptoAlert {
  id: string;
  symbol: string;
  name: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: Date;
  triggered: boolean;
}

const STORAGE_KEY = 'crypto_price_alerts';

export function useCryptoAlerts(cryptos: Cryptocurrency[]) {
  const [alerts, setAlerts] = useState<CryptoAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }));
      }
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
    return [];
  });

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts against current prices
  useEffect(() => {
    if (cryptos.length === 0) return;

    const activeAlerts = alerts.filter(a => !a.triggered);
    
    activeAlerts.forEach(alert => {
      const crypto = cryptos.find(c => c.symbol === alert.symbol);
      if (!crypto) return;

      const isTriggered = alert.condition === 'above' 
        ? crypto.price >= alert.targetPrice
        : crypto.price <= alert.targetPrice;

      if (isTriggered) {
        toast.success(
          `🚨 ${alert.name} Alert Triggered!`,
          {
            description: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice.toLocaleString()} (Current: $${crypto.price.toLocaleString()})`,
            duration: 10000,
          }
        );

        setAlerts(prev => prev.map(a => 
          a.id === alert.id ? { ...a, triggered: true } : a
        ));
      }
    });
  }, [cryptos, alerts]);

  const addAlert = useCallback((
    symbol: string,
    name: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    const newAlert: CryptoAlert = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      name,
      targetPrice,
      condition,
      createdAt: new Date(),
      triggered: false,
    };

    setAlerts(prev => [...prev, newAlert]);
    toast.success(`Alert set for ${symbol} ${condition} $${targetPrice.toLocaleString()}`);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.info('Alert removed');
  }, []);

  const clearTriggeredAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(a => !a.triggered));
  }, []);

  return {
    alerts,
    activeAlerts: alerts.filter(a => !a.triggered),
    triggeredAlerts: alerts.filter(a => a.triggered),
    addAlert,
    removeAlert,
    clearTriggeredAlerts,
  };
}
