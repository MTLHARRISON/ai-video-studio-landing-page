import { useParams, Link } from 'react-router-dom';
import { TEAMS } from '../data/teams';
import { Flag } from 'lucide-react';

export default function TeamPage() {
  const { teamId } = useParams();
  if (!teamId) return null;

  const team = TEAMS[teamId];
  if (!team) {
    return (
      <div className="container mx-auto px-6 py-12">
        <p className="text-center text-muted-foreground">Team not found</p>
        <div className="text-center mt-4">
          <Link to="/" className="text-primary underline">Back home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-md overflow-hidden bg-white flex items-center justify-center" style={{ backgroundColor: `${team.color}22` }}>
            {team.logo ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" /> : <Flag />}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-sm text-muted-foreground">Constructor overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-muted-foreground">{team.description}</p>
            </div>

            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">Season highlights</h2>
              <p className="text-sm text-muted-foreground">Placeholder for season summary, results, and news. You can extend this using Ergast API queries.</p>
            </div>
          </div>

          <aside>
            <div className="bg-card/50 border border-border rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Drivers</h3>
              <div className="space-y-3">
                {team.drivers?.map(d => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{d.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">Driver</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3">Quick links</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><a href="#" className="underline">Team news</a></li>
                <li><a href="#" className="underline">Team history</a></li>
                <li><a href="#" className="underline">Gallery</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
