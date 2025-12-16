import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Timer, Trophy } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

// Import local track images from /src/img/tracks/
// All images follow the naming convention: {Country}_Circuit.avif

// Australian Grand Prix
import australiaTrack from '../img/tracks/Australia_Circuit.avif';

// Chinese Grand Prix
import chinaTrack from '../img/tracks/China_Circuit.avif';

// Japanese Grand Prix
import japanTrack from '../img/tracks/Japan_Circuit.avif';

// Bahrain Grand Prix
import bahrainTrack from '../img/tracks/Bahrain_Circuit.avif';

// Saudi Arabian Grand Prix
import saudiArabiaTrack from '../img/tracks/Saudi_Arabia_Circuit.avif';

// Miami Grand Prix
import miamiTrack from '../img/tracks/Miami_Circuit.avif';

// Emilia Romagna Grand Prix
import emiliaRomagnaTrack from '../img/tracks/Emilia_Romagna_Circuit.avif';

// Monaco Grand Prix
import monacoTrack from '../img/tracks/Monaco_Circuit.avif';

// Canadian Grand Prix
import canadaTrack from '../img/tracks/Canada_Circuit.avif';

// Spanish Grand Prix
import spainTrack from '../img/tracks/Spain_Circuit.avif';

// Austrian Grand Prix
import austriaTrack from '../img/tracks/Austria_Circuit.avif';

// British Grand Prix
import greatBritainTrack from '../img/tracks/Great_Britain_Circuit.avif';

// Hungarian Grand Prix
import hungaryTrack from '../img/tracks/Hungary_Circuit.avif';

// Belgian Grand Prix
import belgiumTrack from '../img/tracks/Belgium_Circuit.avif';

// Dutch Grand Prix
import netherlandsTrack from '../img/tracks/Netherlands_Circuit.avif';

// Italian Grand Prix
import italyTrack from '../img/tracks/Italy_Circuit.avif';

// Azerbaijan Grand Prix
import bakuTrack from '../img/tracks/Baku_Circuit.avif';

// Singapore Grand Prix
import singaporeTrack from '../img/tracks/Singapore_Circuit.avif';

// United States Grand Prix (COTA)
import usaTrack from '../img/tracks/USA_Circuit.avif';

// Mexican Grand Prix
import mexicoTrack from '../img/tracks/Mexico_Circuit.avif';

// Brazilian Grand Prix
import brazilTrack from '../img/tracks/Brazil_Circuit.avif';

// Las Vegas Grand Prix
import lasVegasTrack from '../img/tracks/Las_Vegas_Circuit.avif';

// Qatar Grand Prix
import qatarTrack from '../img/tracks/Qatar_Circuit.avif';

// Abu Dhabi Grand Prix
import abuDhabiTrack from '../img/tracks/Abu_Dhabi_Circuit.avif';

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

// Local track images (prioritized)
// Maps circuit IDs to imported local track images
const LOCAL_TRACK_IMAGES: Record<string, string> = {
  // Australian Grand Prix
  albert_park: australiaTrack,
  
  // Chinese Grand Prix
  shanghai: chinaTrack,
  
  // Japanese Grand Prix
  suzuka: japanTrack,
  
  // Bahrain Grand Prix
  bahrain: bahrainTrack,
  
  // Saudi Arabian Grand Prix
  jeddah: saudiArabiaTrack,
  
  // Miami Grand Prix
  miami: miamiTrack,
  
  // Emilia Romagna Grand Prix
  imola: emiliaRomagnaTrack,
  
  // Monaco Grand Prix
  monaco: monacoTrack,
  
  // Canadian Grand Prix
  villeneuve: canadaTrack,
  
  // Spanish Grand Prix
  barcelona: spainTrack,
  
  // Austrian Grand Prix
  red_bull_ring: austriaTrack,
  
  // British Grand Prix
  silverstone: greatBritainTrack,
  
  // Hungarian Grand Prix
  hungaroring: hungaryTrack,
  
  // Belgian Grand Prix
  spa: belgiumTrack,
  
  // Dutch Grand Prix
  zandvoort: netherlandsTrack,
  
  // Italian Grand Prix
  monza: italyTrack,
  
  // Azerbaijan Grand Prix
  baku: bakuTrack,
  
  // Singapore Grand Prix
  marina_bay: singaporeTrack,
  
  // United States Grand Prix (COTA)
  americas: usaTrack,
  
  // Mexican Grand Prix
  rodriguez: mexicoTrack,
  
  // Brazilian Grand Prix
  interlagos: brazilTrack,
  
  // Las Vegas Grand Prix
  vegas: lasVegasTrack,
  
  // Qatar Grand Prix
  losail: qatarTrack,
  
  // Abu Dhabi Grand Prix
  yas_marina: abuDhabiTrack,
};

// Fallback to external F1 media URLs if local images aren't available
// Map circuit IDs to their official F1 track outline image URLs
// Using versioned URLs for better reliability with F1 media CDN
const EXTERNAL_TRACK_IMAGES: Record<string, string> = {
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
  
  // Brazilian Grand Prix (fallback to external if local not available)
  interlagos: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Brazil.png',
  
  // Las Vegas Grand Prix
  vegas: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677249931/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Las%20Vegas.png',
  
  // Qatar Grand Prix
  losail: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Qatar.png',
  
  // Abu Dhabi Grand Prix
  yas_marina: 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20Outline%20Images/Abu%20Dhabi.png',
};

// Helper function to get track image URL with fallback
// Priority: Local images > SportMonks images > External F1 media URLs
const getTrackImageUrl = (circuitId: string, sportMonksImages?: Record<string, string>): string | null => {
  // 1. Try local images first (highest priority)
  if (LOCAL_TRACK_IMAGES[circuitId]) {
    return LOCAL_TRACK_IMAGES[circuitId];
  }
  
  // 2. Try normalized key for local images
  const normalizedId = circuitId.toLowerCase().replace(/[\s-]/g, '_');
  if (LOCAL_TRACK_IMAGES[normalizedId]) {
    return LOCAL_TRACK_IMAGES[normalizedId];
  }
  
  // 3. Try SportMonks images if available
  if (sportMonksImages && sportMonksImages[circuitId]) {
    return sportMonksImages[circuitId];
  }
  
  // 4. Try direct match in external F1 media
  if (EXTERNAL_TRACK_IMAGES[circuitId]) {
    return EXTERNAL_TRACK_IMAGES[circuitId];
  }
  
  // 5. Try normalized key for external images
  if (EXTERNAL_TRACK_IMAGES[normalizedId]) {
    return EXTERNAL_TRACK_IMAGES[normalizedId];
  }
  
  // 6. Try partial matches in external images
  for (const [key, url] of Object.entries(EXTERNAL_TRACK_IMAGES)) {
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
  const [trackImages, setTrackImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch track images - try SportMonks first, fallback to F1 media
  useEffect(() => {
    const fetchTrackImages = async () => {
        // Initialize with external F1 media URLs as fallback
        const imageMap: Record<string, string> = { ...EXTERNAL_TRACK_IMAGES };
      
      try {
        // Try to fetch from SportMonks API if API token is provided via environment variable
        // For now, we'll use F1 media URLs which are reliable
        // If you have a SportMonks API token, you can add it here:
        // const SPORTMONKS_API_TOKEN = import.meta.env.VITE_SPORTMONKS_API_TOKEN;
        // if (SPORTMONKS_API_TOKEN) {
        //   const response = await fetch(`https://f1.sportmonks.com/api/v1.0/tracks/season/2025?api_token=${SPORTMONKS_API_TOKEN}`);
        //   const data = await response.json();
        //   // Process track images from API response
        // }

        // Since SportMonks requires API access, we'll use F1 media URLs
        // These are reliable and publicly accessible
        // Merge local images (higher priority)
        const finalImageMap = { ...imageMap, ...LOCAL_TRACK_IMAGES };
        setTrackImages(finalImageMap);
      } catch (err) {
        console.error('Failed to load track images, using fallback');
        // Merge local images even on error
        const finalImageMap = { ...EXTERNAL_TRACK_IMAGES, ...LOCAL_TRACK_IMAGES };
        setTrackImages(finalImageMap);
      }
    };

    fetchTrackImages();
  }, []);

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
                const trackImage = getTrackImageUrl(race.Circuit.circuitId, trackImages);
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
                      <div className="relative h-32 sm:h-40 md:h-48 mb-4 flex items-center justify-center bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
                        {trackImage ? (
                          <>
                            <img
                              src={trackImage}
                              alt={race.Circuit.circuitName}
                              className="max-h-full max-w-full object-contain opacity-90 invert dark:invert-0 transition-opacity hover:opacity-100"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                console.warn(`Failed to load track image for ${race.Circuit.circuitId}:`, trackImage);
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.track-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="track-fallback text-muted-foreground text-sm flex items-center justify-center hidden"
                              style={{ minHeight: '128px', position: 'absolute', inset: 0 }}
                            >
                              <div className="text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">Track map unavailable</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div 
                            className="text-muted-foreground text-sm flex items-center justify-center"
                            style={{ minHeight: '128px' }}
                          >
                            <div className="text-center">
                              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">Track map unavailable</p>
                              <p className="text-[10px] opacity-70 mt-1">Circuit: {race.Circuit.circuitId}</p>
                            </div>
                          </div>
                        )}
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