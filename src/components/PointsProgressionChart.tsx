import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RaceResult {
  round: string;
  raceName: string;
  Results: Array<{
    Driver: {
      driverId: string;
      givenName: string;
      familyName: string;
    };
    points: string;
  }>;
}

interface ChartData {
  round: string;
  [key: string]: string | number;
}

const CONSTRUCTOR_COLORS: Record<string, string> = {
  mclaren: '#FF8000',
  red_bull: '#3671C6',
  ferrari: '#E80020',
  mercedes: '#27F4D2',
  aston_martin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  haas: '#B6BABD',
  kick_sauber: '#52E252',
  rb: '#6692FF',
};

export function PointsProgressionChart({ topDrivers }: { topDrivers: Array<{ driverId: string; name: string; constructor: string }> }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaceResults = async () => {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/results.json?limit=500');
        const data = await response.json();
        const races: RaceResult[] = data.MRData.RaceTable.Races;

        // Calculate cumulative points per round
        const cumulativePoints: Record<string, number> = {};
        topDrivers.forEach(d => { cumulativePoints[d.driverId] = 0; });

        const processedData: ChartData[] = races.map((race) => {
          race.Results.forEach(result => {
            if (cumulativePoints[result.Driver.driverId] !== undefined) {
              cumulativePoints[result.Driver.driverId] += parseFloat(result.points);
            }
          });

          const dataPoint: ChartData = { round: `R${race.round}` };
          topDrivers.forEach(driver => {
            dataPoint[driver.driverId] = cumulativePoints[driver.driverId];
          });
          return dataPoint;
        });

        setChartData(processedData);
      } catch (err) {
        console.error('Failed to load race results');
      } finally {
        setLoading(false);
      }
    };

    if (topDrivers.length > 0) {
      fetchRaceResults();
    }
  }, [topDrivers]);

  if (loading) {
    return (
      <div className="h-64 md:h-80 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  if (chartData.length === 0) return null;

  const getConstructorColor = (constructor: string) => {
    const key = constructor.toLowerCase().replace(/ /g, '_');
    return CONSTRUCTOR_COLORS[key] || '#888888';
  };

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="round" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend />
          {topDrivers.map((driver) => (
            <Line
              key={driver.driverId}
              type="monotone"
              dataKey={driver.driverId}
              name={driver.name}
              stroke={getConstructorColor(driver.constructor)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}