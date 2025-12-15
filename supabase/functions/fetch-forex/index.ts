import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching forex rates from ExchangeRate-API...');
    
    // Using the free tier of exchangerate-api (no key required for basic usage)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      console.error('ExchangeRate-API error:', response.status, response.statusText);
      throw new Error(`ExchangeRate-API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received forex rates');

    const rates: ExchangeRates = {
      base: data.base,
      rates: {
        USD: 1,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        JPY: data.rates.JPY,
        CAD: data.rates.CAD,
        CHF: data.rates.CHF,
        AUD: data.rates.AUD,
        CNY: data.rates.CNY,
        INR: data.rates.INR,
        MXN: data.rates.MXN,
      },
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-forex function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
