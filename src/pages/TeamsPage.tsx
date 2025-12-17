import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, ArrowRight, Flag, TrendingUp, Award } from 'lucide-react';

interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    url: string;
    name: string;
    nationality: string;
  };
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

export default function TeamsPage() {
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json');
        const data = await response.json();
        setStandings(data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []);
      } catch (error) {
        console.error('Error fetching constructor standings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  const getTeamData = (constructorId: string) => {
    return TEAM_HISTORICAL_DATA[constructorId] || null;
  };

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
            <Link to="/teams" className="text-sm text-foreground font-medium">Teams</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="relative py-16 sm:py-24 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/f1-car-icon.svg')] bg-center bg-no-repeat opacity-5" style={{ backgroundSize: '600px' }} />
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              2025 Season
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4">
              F1 <span className="text-primary">Constructors</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Current season standings and historical achievements for all Formula 1 teams
            </p>
          </div>
        </div>
      </div>

      {/* Standings */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Constructor Standings</h2>
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {standings.map((standing) => {
                const teamData = getTeamData(standing.Constructor.constructorId);
                const teamColor = teamData?.color || '#666';

                return (
                  <Link
                    key={standing.Constructor.constructorId}
                    to={`/teams/${standing.Constructor.constructorId}`}
                    className="group block"
                  >
                    <div
                      className="relative overflow-hidden bg-card/50 border border-border rounded-xl p-4 sm:p-6 hover:border-primary/50 transition-all duration-300"
                      style={{ borderLeftWidth: '4px', borderLeftColor: teamColor }}
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                        {/* Position */}
                        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-black text-foreground">{standing.position}</span>
                        </div>

                        {/* Team Logo & Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {teamData?.logo && (
                            <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                              <img src={teamData.logo} alt={standing.Constructor.name} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {teamData?.fullName || standing.Constructor.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{standing.Constructor.nationality}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 sm:gap-10">
                          <div className="text-center hidden sm:block">
                            <p className="text-2xl font-bold text-foreground">{standing.wins}</p>
                            <p className="text-xs text-muted-foreground">Wins</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl sm:text-3xl font-black text-foreground">{standing.points}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Historical Stats Grid */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Award className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">All-Time Records</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(TEAM_HISTORICAL_DATA).sort((a, b) => b.worldChampionships - a.worldChampionships).map((team) => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="group bg-card/50 border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                <div className="h-2" style={{ backgroundColor: team.color }} />
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg p-2">
                      <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{team.name}</h3>
                      <p className="text-xs text-muted-foreground">{team.base}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{team.worldChampionships}</p>
                      <p className="text-xs text-muted-foreground">Championships</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{team.polePositions}</p>
                      <p className="text-xs text-muted-foreground">Pole Positions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>First Entry: {team.firstEntry}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
          <p>F1 Championship Tracker • Data from Ergast F1 API</p>
        </div>
      </footer>
    </div>
  );
}
