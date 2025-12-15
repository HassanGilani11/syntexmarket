import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const symbolToId: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'AVAX': 'avalanche-2'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, days = 7 } = await req.json().catch(() => ({ symbol: 'BTC', days: 7 }));
    
    const coinId = symbolToId[symbol] || 'bitcoin';
    console.log(`Fetching ${days} days of history for ${symbol} (${coinId})...`);
    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Received ${data.prices?.length || 0} price points`);

    // Transform data for charting
    const prices = data.prices.map((point: [number, number]) => ({
      timestamp: point[0],
      date: new Date(point[0]).toISOString(),
      price: point[1]
    }));

    const volumes = data.total_volumes.map((point: [number, number]) => ({
      timestamp: point[0],
      date: new Date(point[0]).toISOString(),
      volume: point[1]
    }));

    return new Response(JSON.stringify({ 
      symbol,
      prices,
      volumes,
      fetchedAt: new Date().toISOString() 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-crypto-history function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
