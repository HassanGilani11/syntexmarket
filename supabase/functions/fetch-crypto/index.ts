import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  supply: number;
  lastUpdated: string;
}

const cryptoIds = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'dogecoin', 'cardano', 'avalanche-2'];

const symbolMap: Record<string, string> = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'binancecoin': 'BNB',
  'solana': 'SOL',
  'ripple': 'XRP',
  'dogecoin': 'DOGE',
  'cardano': 'ADA',
  'avalanche-2': 'AVAX'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching crypto data from CoinGecko...');
    
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Received ${data.length} cryptocurrencies from CoinGecko`);

    const cryptos: CryptoData[] = data.map((coin: any) => ({
      symbol: symbolMap[coin.id] || coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_24h || 0,
      changePercent: coin.price_change_percentage_24h || 0,
      marketCap: coin.market_cap || 0,
      volume: coin.total_volume || 0,
      supply: coin.circulating_supply || 0,
      lastUpdated: new Date().toISOString()
    }));

    return new Response(JSON.stringify({ cryptos, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-crypto function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
