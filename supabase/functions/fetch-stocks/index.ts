import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY');

// Stock symbols to fetch
const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'V', 'JPM', 'JNJ'];

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}

const stockNames: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corp.',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corp.',
  'TSLA': 'Tesla Inc.',
  'META': 'Meta Platforms Inc.',
  'V': 'Visa Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson'
};

// Approximate market caps (updated less frequently)
const marketCaps: Record<string, number> = {
  'AAPL': 3000000000000,
  'MSFT': 3100000000000,
  'GOOGL': 2000000000000,
  'AMZN': 1900000000000,
  'NVDA': 3200000000000,
  'TSLA': 780000000000,
  'META': 1300000000000,
  'V': 560000000000,
  'JPM': 530000000000,
  'JNJ': 400000000000
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json().catch(() => ({ symbols: STOCK_SYMBOLS }));
    const symbolsToFetch = symbols || STOCK_SYMBOLS;
    
    console.log('Fetching stocks:', symbolsToFetch);
    
    if (!ALPHA_VANTAGE_API_KEY) {
      console.error('ALPHA_VANTAGE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stocks: StockQuote[] = [];
    
    // Alpha Vantage free tier: 25 requests/day, so we fetch one at a time with delay
    for (const symbol of symbolsToFetch.slice(0, 5)) { // Limit to 5 stocks to conserve API calls
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        console.log(`Fetching ${symbol}...`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`Response for ${symbol}:`, JSON.stringify(data));
        
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          const quote = data['Global Quote'];
          stocks.push({
            symbol: symbol,
            name: stockNames[symbol] || symbol,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            volume: parseInt(quote['06. volume'] || '0'),
            marketCap: marketCaps[symbol] || 0,
            lastUpdated: new Date().toISOString()
          });
        } else if (data['Note']) {
          // API rate limit hit
          console.log('API rate limit reached:', data['Note']);
          break;
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err);
      }
    }

    console.log(`Successfully fetched ${stocks.length} stocks`);
    
    return new Response(JSON.stringify({ stocks, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-stocks function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
