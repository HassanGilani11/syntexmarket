
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useMarketIndices, mockIndices } from '@/utils/stocksApi';
import { Globe } from 'lucide-react';

const Global = () => {
  const indices = useMarketIndices(mockIndices);
  
  const regions = [
    { name: 'North America', markets: ['United States', 'Canada', 'Mexico', 'Brazil'] },
    { name: 'Europe', markets: ['United Kingdom', 'Germany', 'France', 'Switzerland', 'Italy', 'Spain', 'Netherlands'] },
    { name: 'Asia-Pacific', markets: ['Japan', 'China', 'Hong Kong', 'Australia', 'South Korea', 'India', 'Singapore', 'Taiwan'] },
    { name: 'Middle East & Africa', markets: ['Saudi Arabia', 'UAE', 'South Africa', 'Israel'] },
  ];
  
  const economicEvents = [
    { time: '08:30 AM', region: 'United States', event: 'Non-Farm Payrolls', impact: 'High' },
    { time: '09:00 AM', region: 'United States', event: 'Unemployment Rate', impact: 'High' },
    { time: '10:00 AM', region: 'Eurozone', event: 'ECB Interest Rate Decision', impact: 'High' },
    { time: '10:30 AM', region: 'United Kingdom', event: 'BoE Rate Decision', impact: 'High' },
    { time: '12:00 PM', region: 'Japan', event: 'Industrial Production', impact: 'Medium' },
    { time: '01:00 PM', region: 'Germany', event: 'Manufacturing PMI', impact: 'Medium' },
    { time: '02:00 PM', region: 'United Kingdom', event: 'GDP (QoQ)', impact: 'Medium' },
    { time: '03:30 PM', region: 'United States', event: 'Fed Speech', impact: 'Medium' },
    { time: '04:00 PM', region: 'China', event: 'Trade Balance', impact: 'Medium' },
    { time: '05:00 PM', region: 'Canada', event: 'CPI Data', impact: 'High' },
  ];
  
  return (
    <PageLayout title="Global Markets">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-card rounded-lg p-6 shadow">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">World Markets Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {regions.map((region) => (
              <div key={region.name} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{region.name}</h3>
                <ul className="space-y-2">
                  {region.markets.map((market) => {
                    const index = indices.find(i => i.region === market);
                    return (
                      <li key={market} className="flex justify-between items-center">
                        <span>{market}</span>
                        {index ? (
                          <span className={index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Economic Calendar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Time</th>
                  <th className="text-left py-2 px-4">Region</th>
                  <th className="text-left py-2 px-4">Event</th>
                  <th className="text-left py-2 px-4">Impact</th>
                </tr>
              </thead>
              <tbody>
                {economicEvents.map((event, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{event.time}</td>
                    <td className="py-2 px-4">{event.region}</td>
                    <td className="py-2 px-4">{event.event}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.impact === 'High' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {event.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Global;
