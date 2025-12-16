import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Timer, Trophy } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface QualifyingResult {
  position: string;
  Driver: {
    givenName: string;
    familyName: string;
    code: string;
  };
  Constructor: {
    name: string;
  };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface RaceResult {
  position: string;
  Driver: {
    givenName: string;
    familyName: string;
    code: string;
  };
  Constructor: {
    name: string;
  };
  Time?: {
    time: string;
  };
}

interface RaceData {
  round: string;
  raceName: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  date: string;
  qualifyingResults?: QualifyingResult[];
  raceResults?: RaceResult[];
}

// Map circuit IDs to their official F1 track outline image URLs
// Using versioned URLs for better reliability with F1 media CDN
const TRACK_IMAGES: Record<string, string> = {
  // Australian Grand Prix
  albert_park: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Australia.png',
  
  // Chinese Grand Prix
  shanghai: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/China.png',
  
  // Japanese Grand Prix
  suzuka: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245033/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Japan.png',
  
  // Bahrain Grand Prix
  bahrain: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Bahrain.png',
  
  // Saudi Arabian Grand Prix
  jeddah: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Saudi%20Arabia.png',
  
  // Miami Grand Prix
  miami: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Miami.png',
  
  // Emilia Romagna Grand Prix
  imola: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245031/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Emilia%20Romagna.png',
  
  // Monaco Grand Prix
  monaco: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Monaco.png',
  
  // Canadian Grand Prix
  villeneuve: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Canada.png',
  
  // Spanish Grand Prix
  barcelona: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1680529432/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Spain.png',
  
  // Austrian Grand Prix
  red_bull_ring: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Austria.png',
  
  // British Grand Prix
  silverstone: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245033/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Great%20Britain.png',
  
  // Hungarian Grand Prix
  hungaroring: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245031/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Hungary.png',
  
  // Belgian Grand Prix
  spa: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Belgium.png',
  
  // Dutch Grand Prix
  zandvoort: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Netherlands.png',
  
  // Italian Grand Prix
  monza: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245031/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Italy.png',
  
  // Azerbaijan Grand Prix
  baku: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Azerbaijan.png',
  
  // Singapore Grand Prix
  marina_bay: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1683639459/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Singapore.png',
  
  // United States Grand Prix (COTA)
  americas: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245034/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/USA.png',
  
  // Mexican Grand Prix
  rodriguez: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Mexico.png',
  
  // Brazilian Grand Prix
  interlagos: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Brazil.png',
  
  // Las Vegas Grand Prix
  vegas: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677249931/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Las%20Vegas.png',
  
  // Qatar Grand Prix
  losail: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Qatar.png',
  
  // Abu Dhabi Grand Prix
  yas_marina: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Abu%20Dhabi.png',
};

// Helper function to get track image URL with fallback
const getTrackImageUrl = (circuitId: string): string | null => {
  // Try direct match first
  if (TRACK_IMAGES[circuitId]) {
    return TRACK_IMAGES[circuitId];
  }
  
  // Try normalized key (replace spaces/hyphens with underscores)
  const normalizedId = circuitId.toLowerCase().replace(/[\s-]/g, '_');
  if (TRACK_IMAGES[normalizedId]) {
    return TRACK_IMAGES[normalizedId];
  }
  
  // Try partial matches
  for (const [key, url] of Object.entries(TRACK_IMAGES)) {
    if (normalizedId.includes(key) || key.includes(normalizedId)) {
      return url;
    }
  }
  
  return null;
};

const CONSTRUCTOR_COLORS: Record<string, string> = {
  mclaren: '#FF8000',
  red_bull: '#3671C6',
  ferrari: '#E80020',
  mercedes: '#27F4D2',
  aston_martin: '#229971',
  alpine: '#0093CC',
  williams: '#64C4FF',
  haas: '#B6BABD',
  sauber: '#52E252',
  rb: '#6692FF',
};

const getConstructorColor = (constructor: string) => {
  const key = constructor.toLowerCase().replace(/ f1 team/g, '').replace(/ /g, '_');
  return CONSTRUCTOR_COLORS[key] || '#888888';
};

export function TrackCarousel() {
  const [races, setRaces] = useState<RaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all race results
        const resultsPromises: Promise<Response>[] = [];
        const qualifyingPromises: Promise<Response>[] = [];
        
        for (let i = 0; i < 5; i++) {
          resultsPromises.push(fetch(`https://api.jolpi.ca/ergast/f1/current/results.json?limit=100&offset=${i * 100}`));
          qualifyingPromises.push(fetch(`https://api.jolpi.ca/ergast/f1/current/qualifying.json?limit=100&offset=${i * 100}`));
        }

        const [resultsResponses, qualifyingResponses] = await Promise.all([
          Promise.all(resultsPromises),
          Promise.all(qualifyingPromises)
        ]);

        const resultsData = await Promise.all(resultsResponses.map(r => r.json()));
        const qualifyingData = await Promise.all(qualifyingResponses.map(r => r.json()));

        // Merge race results
        const raceMap = new Map<string, RaceData>();
        
        resultsData.forEach(data => {
          data.MRData.RaceTable.Races.forEach((race: any) => {
            if (!raceMap.has(race.round)) {
              raceMap.set(race.round, {
                round: race.round,
                raceName: race.raceName,
                Circuit: race.Circuit,
                date: race.date,
                raceResults: race.Results?.slice(0, 3) || []
              });
            } else {
              const existing = raceMap.get(race.round)!;
              if (!existing.raceResults?.length) {
                existing.raceResults = race.Results?.slice(0, 3) || [];
              }
            }
          });
        });

        // Merge qualifying results
        qualifyingData.forEach(data => {
          data.MRData.RaceTable.Races.forEach((race: any) => {
            if (raceMap.has(race.round)) {
              const existing = raceMap.get(race.round)!;
              if (!existing.qualifyingResults?.length && race.QualifyingResults?.length) {
                existing.qualifyingResults = [race.QualifyingResults[0]];
              }
            }
          });
        });

        const sortedRaces = Array.from(raceMap.values()).sort((a, b) => parseInt(a.round) - parseInt(b.round));
        setRaces(sortedRaces);
      } catch (err) {
        console.error('Failed to load track data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (loading) {
    return (
      <div className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
            <div className="h-64 bg-muted rounded-xl max-w-lg mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            {races.length} Circuits
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            2025 Race Calendar
          </h2>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors -translate-x-2 sm:-translate-x-6"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors translate-x-2 sm:translate-x-6"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {races.map((race, index) => {
                const trackImage = getTrackImageUrl(race.Circuit.circuitId);
                const poleTime = race.qualifyingResults?.[0]?.Q3 || race.qualifyingResults?.[0]?.Q2 || race.qualifyingResults?.[0]?.Q1;
                const poleSitter = race.qualifyingResults?.[0];

                return (
                  <div
                    key={race.round}
                    className="flex-none w-full sm:w-[85%] md:w-[75%] px-2 sm:px-4"
                  >
                    <div className={`bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 transition-all duration-300 ${selectedIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-60'}`}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">Round {race.round}</p>
                          <h3 className="text-lg sm:text-xl font-bold text-foreground">{race.raceName}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">{race.Circuit.Location.locality}, {race.Circuit.Location.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{new Date(race.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>

                      {/* Track Map */}
                      <div className="relative h-32 sm:h-40 md:h-48 mb-4 flex items-center justify-center bg-muted/20 rounded-lg border border-border/50">
                        {trackImage ? (
                          <img
                            src={trackImage}
                            alt={race.Circuit.circuitName}
                            className="max-h-full max-w-full object-contain opacity-90 invert dark:invert-0 transition-opacity hover:opacity-100"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`text-muted-foreground text-sm flex items-center justify-center ${trackImage ? 'hidden' : 'flex'}`}
                          style={{ minHeight: '128px' }}
                        >
                          <div className="text-center">
                            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Track map unavailable</p>
                          </div>
                        </div>
                      </div>

                      {/* Pole Position */}
                      {poleSitter && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Timer className="w-4 h-4 text-primary" />
                            <span className="text-xs sm:text-sm font-medium text-foreground">Pole Position</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-1 h-8 rounded-full"
                                style={{ backgroundColor: getConstructorColor(poleSitter.Constructor.name) }}
                              />
                              <div>
                                <p className="font-semibold text-foreground text-sm">{poleSitter.Driver.code}</p>
                                <p className="text-xs text-muted-foreground">{poleSitter.Constructor.name}</p>
                              </div>
                            </div>
                            <p className="font-mono text-sm sm:text-base font-bold text-primary">{poleTime || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {/* Podium */}
                      {race.raceResults && race.raceResults.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs sm:text-sm font-medium text-foreground">Podium</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {race.raceResults.map((result, idx) => (
                              <div
                                key={result.Driver.code}
                                className={`p-2 sm:p-3 rounded-xl text-center ${
                                  idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                                  idx === 1 ? 'bg-slate-400/10 border border-slate-400/30' :
                                  'bg-amber-700/10 border border-amber-700/30'
                                }`}
                              >
                                <div 
                                  className="w-1.5 h-1.5 rounded-full mx-auto mb-1"
                                  style={{ backgroundColor: getConstructorColor(result.Constructor.name) }}
                                />
                                <p className={`text-xs font-bold ${
                                  idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-amber-600'
                                }`}>P{result.position}</p>
                                <p className="font-semibold text-foreground text-xs sm:text-sm">{result.Driver.code}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{result.Constructor.name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-6">
            {races.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  selectedIndex === index ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}