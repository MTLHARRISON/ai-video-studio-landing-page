import { useEffect, useState } from 'react';
import { Trophy, Flag } from 'lucide-react';

interface Driver {
  position: string;
  points: string;
  wins: string;
  Driver: {
    givenName: string;
    familyName: string;
    nationality: string;
    code: string;
    driverId: string;
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

// Map driver IDs to their official F1 image URLs
const getDriverImageUrl = (driverId: string, familyName: string) => {
  const driverImageMap: Record<string, string> = {
    norris: 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    max_verstappen: 'https://media.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    piastri: 'https://media.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    russell: 'https://media.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    leclerc: 'https://media.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    hamilton: 'https://media.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
    antonelli: 'https://media.formula1.com/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png',
    albon: 'https://media.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
    sainz: 'https://media.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
    alonso: 'https://media.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    hulkenberg: 'https://media.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
    hadjar: 'https://media.formula1.com/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png',
    bearman: 'https://media.formula1.com/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png',
    lawson: 'https://media.formula1.com/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png',
    ocon: 'https://media.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
    stroll: 'https://media.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    tsunoda: 'https://media.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
    gasly: 'https://media.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
    bortoleto: 'https://media.formula1.com/content/dam/fom-website/drivers/G/GRABBOR01_Gabriel_Bortoleto/grabbor01.png',
    colapinto: 'https://media.formula1.com/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png',
    doohan: 'https://media.formula1.com/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png',
  };
  return driverImageMap[driverId] || null;
};

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
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-1">
                  <img
                    src={getDriverImageUrl(leader.Driver.driverId, leader.Driver.familyName) || ''}
                    alt={`${leader.Driver.givenName} ${leader.Driver.familyName}`}
                    className="w-full h-full rounded-full object-cover object-top bg-yellow-500/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-sm font-bold text-black">
                  1
                </div>
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
              <div className="text-right flex items-center gap-3">
                <Trophy className="w-14 h-14 text-yellow-500" />
                <div>
                  <p className="text-4xl font-bold text-foreground">{leader.points}</p>
                  <p className="text-sm text-muted-foreground">points</p>
                  <p className="text-sm text-primary mt-1">{leader.wins} wins</p>
                </div>
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
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full p-0.5 ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-600'
                        : index === 1
                        ? 'bg-gradient-to-br from-slate-300 to-slate-500'
                        : 'bg-gradient-to-br from-amber-600 to-amber-800'
                    }`}
                  >
                    <img
                      src={getDriverImageUrl(driver.Driver.driverId, driver.Driver.familyName) || ''}
                      alt={`${driver.Driver.givenName} ${driver.Driver.familyName}`}
                      className="w-full h-full rounded-full object-cover object-top bg-muted"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-yellow-500 text-black'
                        : index === 1
                        ? 'bg-slate-400 text-black'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    {driver.position}
                  </div>
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
