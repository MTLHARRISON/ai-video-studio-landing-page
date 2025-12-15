import { useEffect, useState } from 'react';
import { Trophy, Flag, Award } from 'lucide-react';

interface Driver {
  position: string;
  points: string;
  wins: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
    code: string;
  };
  Constructors: Array<{
    name: string;
  }>;
}

interface StandingsData {
  season: string;
  round: string;
  DriverStandings: Driver[];
}

export function F1Championship() {
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverstandings.json');
        const data = await response.json();
        const standingsList = data.MRData.StandingsTable.StandingsLists[0];
        setStandings(standingsList);
      } catch (err) {
        setError('Failed to load F1 standings');
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-40 bg-muted rounded-xl max-w-md mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !standings) {
    return null;
  }

  const leader = standings.DriverStandings[0];
  const topThree = standings.DriverStandings.slice(0, 3);

  return (
    <div className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Flag className="w-4 h-4" />
            {standings.season} Season • Round {standings.round}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            F1 Championship Standings
          </h2>
        </div>

        {/* Leader Card */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="absolute top-4 right-4">
              <Trophy className="w-12 h-12 text-yellow-500/50" />
            </div>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl font-bold text-black">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                  Championship Leader
                </p>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  {leader.Driver.givenName} {leader.Driver.familyName}
                </h3>
                <p className="text-muted-foreground">
                  {leader.Constructors[0]?.name} • {leader.Driver.nationality}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-foreground">{leader.points}</p>
                <p className="text-sm text-muted-foreground">points</p>
                <p className="text-sm text-primary mt-1">{leader.wins} wins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {topThree.map((driver, index) => (
            <div
              key={driver.Driver.code}
              className={`relative p-6 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 ${
                index === 0
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : index === 1
                  ? 'bg-slate-400/10 border-slate-400/30'
                  : 'bg-amber-700/10 border-amber-700/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0
                      ? 'bg-yellow-500 text-black'
                      : index === 1
                      ? 'bg-slate-400 text-black'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  {driver.position}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {driver.Driver.givenName} {driver.Driver.familyName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {driver.Constructors[0]?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{driver.points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Data provided by Ergast F1 API
        </p>
      </div>
    </div>
  );
}
