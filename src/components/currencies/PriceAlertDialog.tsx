import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BellIcon, BellRingIcon, Trash2Icon } from 'lucide-react';
import { Cryptocurrency } from '@/utils/stocksApi';
import { CryptoAlert } from '@/hooks/useCryptoAlerts';
import { cn } from '@/lib/utils';

interface PriceAlertDialogProps {
  cryptos: Cryptocurrency[];
  alerts: CryptoAlert[];
  onAddAlert: (symbol: string, name: string, targetPrice: number, condition: 'above' | 'below') => void;
  onRemoveAlert: (id: string) => void;
  onClearTriggered: () => void;
}

export function PriceAlertDialog({
  cryptos,
  alerts,
  onAddAlert,
  onRemoveAlert,
  onClearTriggered,
}: PriceAlertDialogProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [open, setOpen] = useState(false);

  const handleAddAlert = () => {
    const crypto = cryptos.find(c => c.symbol === selectedCrypto);
    if (!crypto || !targetPrice) return;

    onAddAlert(selectedCrypto, crypto.name, parseFloat(targetPrice), condition);
    setTargetPrice('');
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BellIcon className="h-4 w-4" />
          Price Alerts
          {activeAlerts.length > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeAlerts.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRingIcon className="h-5 w-5" />
            Crypto Price Alerts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new alert form */}
          <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-medium text-sm">Create New Alert</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="crypto" className="text-xs">Cryptocurrency</Label>
                <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                  <SelectTrigger id="crypto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptos.map(crypto => (
                      <SelectItem key={crypto.symbol} value={crypto.symbol}>
                        {crypto.symbol} - ${crypto.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="condition" className="text-xs">Condition</Label>
                <Select value={condition} onValueChange={(v) => setCondition(v as 'above' | 'below')}>
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Goes Above</SelectItem>
                    <SelectItem value="below">Goes Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="target-price" className="text-xs">Target Price ($)</Label>
              <Input
                id="target-price"
                type="number"
                step="0.01"
                placeholder="Enter target price..."
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
              />
            </div>
            <Button onClick={handleAddAlert} className="w-full" disabled={!targetPrice}>
              Set Alert
            </Button>
          </div>

          {/* Active alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Active Alerts ({activeAlerts.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-2 bg-secondary/40 rounded-md text-sm"
                  >
                    <div>
                      <span className="font-medium">{alert.symbol}</span>
                      <span className="text-muted-foreground ml-2">
                        {alert.condition} ${alert.targetPrice.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveAlert(alert.id)}
                    >
                      <Trash2Icon className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Triggered alerts */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-success">
                  Triggered Alerts ({triggeredAlerts.length})
                </h4>
                <Button variant="ghost" size="sm" onClick={onClearTriggered}>
                  Clear All
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {triggeredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md text-sm",
                      "bg-success/10 border border-success/20"
                    )}
                  >
                    <div>
                      <span className="font-medium">{alert.symbol}</span>
                      <span className="text-muted-foreground ml-2">
                        reached {alert.condition} ${alert.targetPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-success">✓ Triggered</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              No price alerts set. Create one above to get notified when prices hit your targets.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
