import { useEffect, useState } from 'react';
import { Trophy, Flag, TrendingUp, Users } from 'lucide-react';
import { PointsProgressionChart } from './PointsProgressionChart';
import { TrackSelectionProvider } from '../lib/trackSelection';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

interface Constructor {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

interface StandingsData {
  season: string;
  round: string;
  DriverStandings: Driver[];
}

interface ConstructorStandingsData {
  season: string;
  round: string;
  ConstructorStandings: Constructor[];
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

// Map constructor IDs/names to their official F1 logo URLs
const getConstructorLogoUrl = (constructorId: string, constructorName: string): string | null => {
  // Try 2025 first, fallback to 2024 if needed
  const currentYear = '2025';
  const fallbackYear = '2024';
  
  const logoMap: Record<string, string> = {
    // McLaren
    mclaren: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/mclaren.png`,
    
    // Red Bull
    red_bull: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/red-bull-racing.png`,
    redbull: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/red-bull-racing.png`,
    
    // Ferrari
    ferrari: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/ferrari.png`,
    
    // Mercedes
    mercedes: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/mercedes.png`,
    
    // Aston Martin
    aston_martin: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/aston-martin.png`,
    'aston martin': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/aston-martin.png`,
    
    // Alpine
    alpine: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/alpine.png`,
    
    // Williams
    williams: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/williams.png`,
    
    // Haas
    haas: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/haas-f1-team.png`,
    'haas f1 team': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/haas-f1-team.png`,
    
    // Sauber / Kick Sauber / Stake F1 Team / Audi
    sauber: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/stake-f1-team-kick-sauber.png`,
    'kick sauber': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/stake-f1-team-kick-sauber.png`,
    'stake f1 team kick sauber': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/stake-f1-team-kick-sauber.png`,
    audi: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/stake-f1-team-kick-sauber.png`,
    
    // RB / Visa Cash App RB / VCARB
    rb: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/rb.png`,
    'rb f1 team': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/rb.png`,
    'visa cash app rb': `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/rb.png`,
    vcarb: `https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/${currentYear}/rb.png`,
  };

  // Normalize the key for lookup
  const normalizedId = constructorId.toLowerCase().replace(/\s+/g, '_');
  const normalizedName = constructorName.toLowerCase().trim();

  // Try constructor ID first
  if (logoMap[normalizedId]) {
    return logoMap[normalizedId];
  }

  // Try normalized name
  if (logoMap[normalizedName]) {
    return logoMap[normalizedName];
  }

  // Try partial matches
  for (const [key, url] of Object.entries(logoMap)) {
    if (normalizedId.includes(key) || key.includes(normalizedId) ||
        normalizedName.includes(key) || key.includes(normalizedName)) {
      return url;
    }
  }

  return null;
};

// Map constructor names to their brand colors
const getConstructorColor = (constructorName: string): string => {
  const colorMap: Record<string, string> = {
    'McLaren': '#FF8000',
    'Red Bull': '#3671C6',
    'Ferrari': '#E80020',
    'Mercedes': '#27F4D2',
    'Aston Martin': '#229971',
    'Alpine': '#0093CC',
    'Williams': '#64C4FF',
    'Haas F1 Team': '#B6BABD',
    'Haas': '#B6BABD',
    'Kick Sauber': '#52E252',
    'Sauber': '#52E252',
    'Stake F1 Team Kick Sauber': '#52E252',
    'RB': '#6692FF',
    'RB F1 Team': '#6692FF',
    'Visa Cash App RB': '#6692FF',
  };
  
  // Try exact match first
  if (colorMap[constructorName]) {
    return colorMap[constructorName];
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(colorMap)) {
    if (constructorName.includes(key) || key.includes(constructorName)) {
      return value;
    }
  }
  
  // Default color
  return '#6B7280';
};

export function F1Championship() {
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [constructorLoading, setConstructorLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [constructorError, setConstructorError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/driverstandings.json');
        const data = await response.json();
        const standingsList = data.MRData.StandingsTable.StandingsLists[0];
        setStandings(standingsList);
      } catch (err) {
        setError('Failed to load F1 driver standings');
      } finally {
        setLoading(false);
      }
    };

    const fetchConstructorStandings = async () => {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorstandings.json');
        const data = await response.json();
        const standingsList = data.MRData.StandingsTable.StandingsLists[0];
        setConstructorStandings(standingsList);
      } catch (err) {
        setConstructorError('Failed to load F1 constructor standings');
      } finally {
        setConstructorLoading(false);
      }
    };

    fetchStandings();
    fetchConstructorStandings();
  }, []);

  const isLoading = loading || constructorLoading;

  if (isLoading) {
    return (
      <div className="py-12 sm:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-40 bg-muted rounded-xl max-w-md mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if ((error || !standings) && (constructorError || !constructorStandings)) {
    return null;
  }

  const season = standings?.season || constructorStandings?.season || '';
  const round = standings?.round || constructorStandings?.round || '';

  const driverLeader = standings?.DriverStandings[0];
  const topThreeDrivers = standings?.DriverStandings.slice(0, 3) || [];

  const constructorLeader = constructorStandings?.ConstructorStandings[0];
  const topThreeConstructors = constructorStandings?.ConstructorStandings.slice(0, 3) || [];

  const topDriversForChart = topThreeDrivers.map(d => ({
    driverId: d.Driver.driverId,
    name: `${d.Driver.givenName} ${d.Driver.familyName}`,
    constructor: d.Constructors[0]?.name || ''
  }));

  return (
    <div id="f1-championship" className="py-12 sm:py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
            {season} Season • Round {round}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            F1 Championship Standings
          </h2>
        </div>

        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="drivers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Drivers
            </TabsTrigger>
            <TabsTrigger value="constructors" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Constructors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="mt-0">
            {error || !standings ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load driver standings
              </div>
            ) : (
              <>

                {/* Driver Leader Card - Mobile Optimized */}
                {driverLeader && (
                  <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
                    <div className="relative bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 sm:p-8 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="relative">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-1">
                            <img
                              src={getDriverImageUrl(driverLeader.Driver.driverId, driverLeader.Driver.familyName) || ''}
                              alt={`${driverLeader.Driver.givenName} ${driverLeader.Driver.familyName}`}
                              className="w-full h-full rounded-full object-cover object-top bg-yellow-500/20"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-sm font-bold text-black">
                            1
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                            Championship Leader
                          </p>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                            {driverLeader.Driver.givenName} {driverLeader.Driver.familyName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {driverLeader.Constructors[0]?.name} • {driverLeader.Driver.nationality}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 sm:text-right">
                          <Trophy className="w-14 h-14 sm:w-20 sm:h-20 text-yellow-500" />
                          <div>
                            <p className="text-3xl sm:text-4xl font-bold text-foreground">{driverLeader.points}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">points</p>
                            <p className="text-xs sm:text-sm text-primary mt-1">{driverLeader.wins} wins</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top 3 Drivers - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12">
                  {topThreeDrivers.map((driver, index) => (
            <div
              key={driver.Driver.code}
              className={`relative p-4 sm:p-6 rounded-xl border backdrop-blur-sm transition-all hover:scale-105 ${
                index === 0
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : index === 1
                  ? 'bg-slate-400/10 border-slate-400/30'
                  : 'bg-amber-700/10 border-amber-700/30'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 ${
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
                    className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
                  <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                    {driver.Driver.givenName} {driver.Driver.familyName}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {driver.Constructors[0]?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-sm sm:text-base">{driver.points}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            </div>
                  ))}
                </div>

                {/* Points Progression Chart */}
                <TrackSelectionProvider>
                  <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-card/50 border border-border rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">Points Progression</h3>
                      </div>
                      <PointsProgressionChart topDrivers={topDriversForChart} />
                    </div>
                  </div>
                </TrackSelectionProvider>
              </>
            )}
          </TabsContent>

          <TabsContent value="constructors" className="mt-0">
            {constructorError || !constructorStandings ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load constructor standings
              </div>
            ) : (
              <>
                {/* Constructor Leader Card - Mobile Optimized */}
                {constructorLeader && (() => {
                  const leaderColor = getConstructorColor(constructorLeader.Constructor.name);
                  const leaderLogo = getConstructorLogoUrl(constructorLeader.Constructor.constructorId, constructorLeader.Constructor.name);
                  return (
                    <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
                      <div 
                        className="relative border rounded-2xl p-4 sm:p-8 backdrop-blur-sm"
                        style={{
                          background: `linear-gradient(to bottom right, ${leaderColor}20, ${leaderColor}10, ${leaderColor}15)`,
                          borderColor: `${leaderColor}50`
                        }}
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                          <div className="relative">
                            <div 
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl p-2 bg-white"
                              style={{
                                background: `linear-gradient(to bottom right, ${leaderColor}15, white)`,
                                border: `2px solid ${leaderColor}40`
                              }}
                            >
                              {leaderLogo ? (
                                <img
                                  src={leaderLogo}
                                  alt={constructorLeader.Constructor.name}
                                  className="w-full h-full rounded-lg object-contain"
                                  onError={(e) => {
                                    // Fallback to initial if image fails
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.constructor-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ${leaderLogo ? 'constructor-fallback hidden' : ''}`}
                                style={{ backgroundColor: `${leaderColor}80` }}
                              >
                                {constructorLeader.Constructor.name.charAt(0)}
                              </div>
                            </div>
                            <div 
                              className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                              style={{ backgroundColor: leaderColor }}
                            >
                              1
                            </div>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1">
                              Championship Leader
                            </p>
                            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                              {constructorLeader.Constructor.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {constructorLeader.Constructor.nationality}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 sm:text-right">
                            <Trophy className="w-14 h-14 sm:w-20 sm:h-20" style={{ color: leaderColor }} />
                            <div>
                              <p className="text-3xl sm:text-4xl font-bold text-foreground">{constructorLeader.points}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">points</p>
                              <p className="text-xs sm:text-sm mt-1" style={{ color: leaderColor }}>
                                {constructorLeader.wins} wins
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Top 3 Constructors - Mobile Optimized */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12">
                  {topThreeConstructors.map((constructor, index) => {
                    const constructorColor = getConstructorColor(constructor.Constructor.name);
                    const constructorLogo = getConstructorLogoUrl(constructor.Constructor.constructorId, constructor.Constructor.name);
                    return (
                      <div
                        key={constructor.Constructor.constructorId}
                        className="relative p-4 sm:p-6 rounded-xl border backdrop-blur-sm transition-all hover:scale-105"
                        style={{
                          background: `${constructorColor}15`,
                          borderColor: `${constructorColor}40`
                        }}
                      >
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="relative">
                            <div
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg p-1 bg-white"
                              style={{
                                background: `linear-gradient(to bottom right, ${constructorColor}15, white)`,
                                border: `2px solid ${constructorColor}40`
                              }}
                            >
                              {constructorLogo ? (
                                <img
                                  src={constructorLogo}
                                  alt={constructor.Constructor.name}
                                  className="w-full h-full rounded-md object-contain"
                                  onError={(e) => {
                                    // Fallback to initial if image fails
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.parentElement?.querySelector('.constructor-fallback') as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`w-full h-full rounded-md flex items-center justify-center text-white font-bold text-sm sm:text-base ${constructorLogo ? 'constructor-fallback hidden' : ''}`}
                                style={{ backgroundColor: `${constructorColor}cc` }}
                              >
                                {constructor.Constructor.name.charAt(0)}
                              </div>
                            </div>
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                              style={{ backgroundColor: constructorColor }}
                            >
                              {constructor.position}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                              {constructor.Constructor.name}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {constructor.Constructor.nationality}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground text-sm sm:text-base">{constructor.points}</p>
                            <p className="text-xs text-muted-foreground">pts</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full Constructor Standings Table */}
                <div className="max-w-4xl mx-auto mb-8">
                  <div className="bg-card/50 border border-border rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Full Standings</h3>
                    <div className="space-y-2">
                      {constructorStandings.ConstructorStandings.map((constructor) => {
                        const constructorColor = getConstructorColor(constructor.Constructor.name);
                        const constructorLogo = getConstructorLogoUrl(constructor.Constructor.constructorId, constructor.Constructor.name);
                        return (
                          <div
                            key={constructor.Constructor.constructorId}
                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all hover:scale-[1.02]"
                            style={{
                              background: `${constructorColor}08`,
                              borderColor: `${constructorColor}30`
                            }}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: constructorColor }}
                              >
                                {constructor.position}
                              </div>
                              <div className="relative flex-shrink-0">
                                <div
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-md p-0.5 bg-white"
                                  style={{
                                    background: `linear-gradient(to bottom right, ${constructorColor}15, white)`,
                                    border: `1.5px solid ${constructorColor}40`
                                  }}
                                >
                                  {constructorLogo ? (
                                    <img
                                      src={constructorLogo}
                                      alt={constructor.Constructor.name}
                                      className="w-full h-full rounded-sm object-contain"
                                      onError={(e) => {
                                        // Fallback to initial if image fails
                                        const target = e.currentTarget as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.parentElement?.querySelector('.constructor-fallback') as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className={`w-full h-full rounded-sm flex items-center justify-center text-white font-bold text-xs ${constructorLogo ? 'constructor-fallback hidden' : ''}`}
                                    style={{ backgroundColor: `${constructorColor}cc` }}
                                  >
                                    {constructor.Constructor.name.charAt(0)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate text-sm sm:text-base">
                                  {constructor.Constructor.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {constructor.Constructor.nationality} • {constructor.wins} wins
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-foreground text-base sm:text-lg">{constructor.points}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          Data provided by Ergast F1 API
        </p>
      </div>
    </div>
  );
}
