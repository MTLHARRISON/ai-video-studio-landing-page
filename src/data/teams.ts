export interface TeamData {
  id: string;
  name: string;
  color: string;
  logo?: string;
  description?: string;
  drivers?: Array<{ id: string; name: string; image?: string }>;
}

export const TEAMS: Record<string, TeamData> = {
  mclaren: {
    id: 'mclaren',
    name: 'McLaren',
    color: '#FF8000',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/mclaren.png',
    description: 'McLaren Racing is a British motor racing team based in Woking, England.',
    drivers: [
      { id: 'norris', name: 'Lando Norris' },
      { id: 'piastri', name: 'Oscar Piastri' },
    ],
  },
  red_bull: {
    id: 'red_bull',
    name: 'Red Bull Racing',
    color: '#3671C6',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/red-bull-racing.png',
    description: 'Red Bull Racing is an Austrian-British Formula One racing team owned by the energy drink company Red Bull GmbH.',
    drivers: [
      { id: 'verstappen', name: 'Max Verstappen' },
      { id: 'perez', name: 'Sergio Pérez' },
    ],
  },
  ferrari: {
    id: 'ferrari',
    name: 'Scuderia Ferrari',
    color: '#E80020',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/ferrari.png',
    description: 'Scuderia Ferrari is the racing division of Italian sports car manufacturer Ferrari.',
    drivers: [
      { id: 'leclerc', name: 'Charles Leclerc' },
      { id: 'sainz', name: 'Carlos Sainz' },
    ],
  },
  // Add other teams as needed (short list for now)
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes-AMG Petronas',
    color: '#27F4D2',
    logo: 'https://media.formula1.com/image/upload/f_auto/q_auto/content/dam/fom-website/teams/2025/mercedes.png',
    description: 'Mercedes-AMG Petronas is the works team of Mercedes-Benz in Formula One.',
    drivers: [
      { id: 'hamilton', name: 'Lewis Hamilton' },
      { id: 'russell', name: 'George Russell' },
    ],
  },
};
