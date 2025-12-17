import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flag, Trophy, Users, Calendar, MapPin, TrendingUp, Timer, ArrowLeft, Award, Zap } from 'lucide-react';

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
}

interface DriverResult {
  driverId: string;
  givenName: string;
  familyName: string;
  points: number;
  wins: number;
}

interface TeamHistoricalData {
  id: string;
  name: string;
  fullName: string;
  color: string;
  logo: string;
  base: string;
  teamPrincipal: string;
  founded: string;
  firstEntry: string;
  worldChampionships: number;
  highestFinish: string;
  polePositions: number;
  fastestLaps: number;
  description: string;
}

const TEAM_HISTORICAL_DATA: Record<string, TeamHistoricalData> = {
  mclaren: {
    id: 'mclaren',
    name: 'McLaren',
    fullName: 'McLaren F1 Team',
    color: '#FF8000',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/mclaren.png',
    base: 'Woking, United Kingdom',
    teamPrincipal: 'Andrea Stella',
    founded: '1963',
    firstEntry: '1966',
    worldChampionships: 8,
    highestFinish: '1st (183 wins)',
    polePositions: 156,
    fastestLaps: 163,
    description: 'McLaren Racing is one of the most successful teams in Formula One history. Founded by New Zealand racing driver Bruce McLaren, the team has won 8 Constructors Championships and produced legends like Ayrton Senna, Alain Prost, and Mika Häkkinen.',
  },
  red_bull: {
    id: 'red_bull',
    name: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    color: '#3671C6',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/red-bull-racing.png',
    base: 'Milton Keynes, United Kingdom',
    teamPrincipal: 'Christian Horner',
    founded: '2005',
    firstEntry: '2005',
    worldChampionships: 6,
    highestFinish: '1st (120 wins)',
    polePositions: 103,
    fastestLaps: 97,
    description: 'Red Bull Racing emerged from the ashes of Jaguar Racing and quickly became a dominant force. Under the guidance of Adrian Newey, they won four consecutive championships with Sebastian Vettel (2010-2013) and dominated the turbo-hybrid era with Max Verstappen.',
  },
  ferrari: {
    id: 'ferrari',
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari',
    color: '#E80020',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/ferrari.png',
    base: 'Maranello, Italy',
    teamPrincipal: 'Frédéric Vasseur',
    founded: '1929',
    firstEntry: '1950',
    worldChampionships: 16,
    highestFinish: '1st (246 wins)',
    polePositions: 251,
    fastestLaps: 260,
    description: 'Scuderia Ferrari is the most successful and longest-standing team in Formula One history. The Prancing Horse has won more races, more championships, and more pole positions than any other team. Legends like Michael Schumacher, Niki Lauda, and Kimi Räikkönen have driven for the Scuderia.',
  },
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes',
    fullName: 'Mercedes-AMG Petronas F1 Team',
    color: '#27F4D2',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/mercedes.png',
    base: 'Brackley, United Kingdom',
    teamPrincipal: 'Toto Wolff',
    founded: '2010',
    firstEntry: '2010',
    worldChampionships: 8,
    highestFinish: '1st (125 wins)',
    polePositions: 136,
    fastestLaps: 99,
    description: 'Mercedes returned to F1 as a works team in 2010 after purchasing Brawn GP. They dominated the turbo-hybrid era from 2014-2021, winning 8 consecutive Constructors Championships. Lewis Hamilton won 6 of his 7 World Championships with Mercedes.',
  },
  aston_martin: {
    id: 'aston_martin',
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    color: '#229971',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/aston-martin.png',
    base: 'Silverstone, United Kingdom',
    teamPrincipal: 'Mike Krack',
    founded: '2021',
    firstEntry: '2021',
    worldChampionships: 0,
    highestFinish: '2nd',
    polePositions: 1,
    fastestLaps: 3,
    description: 'Aston Martin returned to Formula One as a constructor in 2021, rebranding from Racing Point. The team is owned by Lawrence Stroll and aims to become a championship-winning team with major investment in new facilities and staff.',
  },
  alpine: {
    id: 'alpine',
    name: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    color: '#FF87BC',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/alpine.png',
    base: 'Enstone, United Kingdom',
    teamPrincipal: 'Oliver Oakes',
    founded: '2021',
    firstEntry: '2021',
    worldChampionships: 2,
    highestFinish: '1st (21 wins as Renault)',
    polePositions: 20,
    fastestLaps: 15,
    description: 'Alpine is the rebrand of the Renault works team. The team\'s heritage includes World Championships won by Fernando Alonso (2005-2006). They continue to develop their own power unit and aim to return to the front of the grid.',
  },
  williams: {
    id: 'williams',
    name: 'Williams',
    fullName: 'Williams Racing',
    color: '#1868DB',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/williams.png',
    base: 'Grove, United Kingdom',
    teamPrincipal: 'James Vowles',
    founded: '1977',
    firstEntry: '1978',
    worldChampionships: 9,
    highestFinish: '1st (114 wins)',
    polePositions: 128,
    fastestLaps: 133,
    description: 'Williams is one of the most successful teams in F1 history. Founded by Sir Frank Williams and Patrick Head, the team won 9 Constructors Championships and produced champions like Nelson Piquet, Nigel Mansell, Alain Prost, and Damon Hill.',
  },
  rb: {
    id: 'rb',
    name: 'RB',
    fullName: 'Visa Cash App RB F1 Team',
    color: '#6692FF',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/rb.png',
    base: 'Faenza, Italy',
    teamPrincipal: 'Laurent Mekies',
    founded: '2006',
    firstEntry: '2006',
    worldChampionships: 0,
    highestFinish: '1st (2 wins)',
    polePositions: 1,
    fastestLaps: 3,
    description: 'RB (formerly AlphaTauri/Toro Rosso) is Red Bull\'s sister team and serves as a development pathway for young drivers. Notable graduates include Sebastian Vettel, Daniel Ricciardo, and Max Verstappen. The team scored a famous win with Pierre Gasly at Monza 2020.',
  },
  haas: {
    id: 'haas',
    name: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    color: '#B6BABD',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/haas.png',
    base: 'Kannapolis, United States',
    teamPrincipal: 'Ayao Komatsu',
    founded: '2016',
    firstEntry: '2016',
    worldChampionships: 0,
    highestFinish: '4th',
    polePositions: 1,
    fastestLaps: 2,
    description: 'Haas F1 Team is the only American constructor in Formula One. Founded by industrialist Gene Haas, the team uses a unique business model with close ties to Ferrari. They achieved their best finish of 5th in the Constructors Championship in 2018.',
  },
  sauber: {
    id: 'sauber',
    name: 'Sauber',
    fullName: 'Stake F1 Team Kick Sauber',
    color: '#52E252',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/kick-sauber.png',
    base: 'Hinwil, Switzerland',
    teamPrincipal: 'Mattia Binotto',
    founded: '1993',
    firstEntry: '1993',
    worldChampionships: 0,
    highestFinish: '1st (1 win as BMW Sauber)',
    polePositions: 1,
    fastestLaps: 5,
    description: 'Sauber Motorsport is a Swiss team that has competed in F1 since 1993. The team has served as a launching pad for drivers like Kimi Räikkönen, Felipe Massa, and Sergio Pérez. From 2026, it will become the Audi works team.',
  },
};

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const [standing, setStanding] = useState<ConstructorStanding | null>(null);
  const [drivers, setDrivers] = useState<DriverResult[]>([]);
  const [loading, setLoading] = useState(true);

  const teamData = teamId ? TEAM_HISTORICAL_DATA[teamId] : null;

  useEffect(() => {
    if (!teamId) return;

    const fetchData = async () => {
      try {
        // Fetch constructor standings
        const standingsRes = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json');
        const standingsData = await standingsRes.json();
        const allStandings = standingsData.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
        const teamStanding = allStandings.find((s: any) => s.Constructor.constructorId === teamId);
        setStanding(teamStanding || null);

        // Fetch driver standings to get team drivers
        const driversRes = await fetch('https://api.jolpi.ca/ergast/f1/current/driverStandings.json');
        const driversData = await driversRes.json();
        const allDrivers = driversData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        
        // Filter drivers by constructor
        const teamDrivers = allDrivers
          .filter((d: any) => d.Constructors.some((c: any) => c.constructorId === teamId))
          .map((d: any) => ({
            driverId: d.Driver.driverId,
            givenName: d.Driver.givenName,
            familyName: d.Driver.familyName,
            points: parseInt(d.points),
            wins: parseInt(d.wins),
          }));
        setDrivers(teamDrivers);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  if (!teamData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Team Not Found</h1>
          <p className="text-muted-foreground mb-6">The team you're looking for doesn't exist.</p>
          <Link to="/teams" className="text-primary hover:underline">← Back to Teams</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <Flag className="w-5 h-5" />
            <span className="font-bold">F1 Tracker</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/teams" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Teams</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="relative py-12 sm:py-20 overflow-hidden" style={{ backgroundColor: `${teamData.color}15` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${teamData.color}20 0%, transparent 50%)` }} />
        <div className="container mx-auto px-6 relative">
          <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Teams
          </Link>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-2xl p-3 shadow-lg">
              <img src={teamData.logo} alt={teamData.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-2">{teamData.fullName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {teamData.base}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {teamData.teamPrincipal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">{teamData.description}</p>
            </section>

            {/* 2025 Season Stats */}
            <section className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                2025 Season Performance
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : standing ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-foreground">{standing.position}</p>
                      <p className="text-xs text-muted-foreground">Position</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-foreground">{standing.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-black text-foreground">{standing.wins}</p>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                  </div>

                  {/* Drivers */}
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Current Drivers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {drivers.map((driver) => (
                      <div 
                        key={driver.driverId} 
                        className="flex items-center gap-3 bg-muted/30 rounded-lg p-3"
                        style={{ borderLeft: `3px solid ${teamData.color}` }}
                      >
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                          {driver.givenName[0]}{driver.familyName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{driver.givenName} {driver.familyName}</p>
                          <p className="text-xs text-muted-foreground">{driver.points} pts • {driver.wins} wins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No standings data available</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Historical Stats */}
            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                All-Time Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">World Championships</span>
                  <span className="font-bold text-foreground">{teamData.worldChampionships}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Pole Positions</span>
                  <span className="font-bold text-foreground">{teamData.polePositions}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Fastest Laps</span>
                  <span className="font-bold text-foreground">{teamData.fastestLaps}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Highest Finish</span>
                  <span className="font-bold text-foreground text-right text-sm">{teamData.highestFinish}</span>
                </div>
              </div>
            </div>

            {/* Team Info */}
            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Team Information
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Founded</span>
                  <span className="font-bold text-foreground">{teamData.founded}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">First F1 Entry</span>
                  <span className="font-bold text-foreground">{teamData.firstEntry}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Team Principal</span>
                  <span className="font-bold text-foreground text-right text-sm">{teamData.teamPrincipal}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Base</span>
                  <span className="font-bold text-foreground text-right text-sm">{teamData.base}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>F1 Championship Tracker • Data from Ergast F1 API</p>
        </div>
      </footer>
    </div>
  );
}
