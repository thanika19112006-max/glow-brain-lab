import React, { useState } from 'react';
import { User, Trophy, Calendar, Clock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { getProfile, saveProfile, getAllBestScores, getRecentScores } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const existingProfile = getProfile();
  const [name, setName] = useState(existingProfile?.name || '');
  const [saved, setSaved] = useState(false);
  
  const bestScores = getAllBestScores();
  const recentScores = getRecentScores(5);

  const gameNames: Record<string, string> = {
    brainmaze: 'BrainMaze',
    memoryflip: 'MemoryFlip+',
    thinkfast: 'ThinkFast',
    reflexiq: 'ReflexIQ',
    wordbend: 'WordBend',
  };

  const gameColors: Record<string, string> = {
    brainmaze: 'text-neon-cyan',
    memoryflip: 'text-neon-magenta',
    thinkfast: 'text-neon-lime',
    reflexiq: 'text-neon-orange',
    wordbend: 'text-neon-purple',
  };

  const handleSave = () => {
    if (name.trim()) {
      saveProfile(name.trim());
      setSaved(true);
      soundManager.play('success');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalScore = Object.values(bestScores).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      <Header />
      
      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <NeonButton variant="cyan" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </NeonButton>
            <h1 className="font-display text-3xl md:text-4xl font-bold neon-text-cyan">
              Player Profile
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <NeonCard variant="cyan" hover={false}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-neon-cyan/20 border border-neon-cyan/30">
                  <User className="w-10 h-10 text-neon-cyan" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Your Profile
                  </h2>
                  <p className="font-body text-muted-foreground text-sm">
                    Customize your player identity
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-muted-foreground block mb-2">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20 font-body text-foreground placeholder:text-muted-foreground transition-all"
                    maxLength={20}
                  />
                </div>

                <NeonButton
                  variant="cyan"
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saved ? 'Saved!' : 'Save Profile'}
                </NeonButton>

                {existingProfile && (
                  <p className="font-body text-xs text-muted-foreground text-center">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Playing since {new Date(existingProfile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </NeonCard>

            {/* Stats Card */}
            <NeonCard variant="magenta" hover={false}>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-neon-magenta/20 border border-neon-magenta/30">
                  <Trophy className="w-10 h-10 text-neon-magenta" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Best Scores
                  </h2>
                  <p className="font-body text-muted-foreground text-sm">
                    Total: <span className="text-neon-yellow font-semibold">{totalScore}</span> points
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(bestScores).map(([game, score]) => (
                  <div
                    key={game}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <span className={`font-body font-medium ${gameColors[game]}`}>
                      {gameNames[game]}
                    </span>
                    <span className="font-display font-bold text-foreground">
                      {score > 0 ? score : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </NeonCard>

            {/* Recent Activity */}
            <NeonCard variant="lime" hover={false} className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-neon-lime/20 border border-neon-lime/30">
                  <Clock className="w-10 h-10 text-neon-lime" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Recent Activity
                  </h2>
                  <p className="font-body text-muted-foreground text-sm">
                    Your latest game sessions
                  </p>
                </div>
              </div>

              {recentScores.length > 0 ? (
                <div className="space-y-2">
                  {recentScores.map((score, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-body font-medium ${gameColors[score.game]}`}>
                          {gameNames[score.game]}
                        </span>
                        {score.level && (
                          <span className="text-xs text-muted-foreground">
                            Level {score.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display font-bold text-foreground">
                          {score.score} pts
                        </span>
                        <span className="font-body text-xs text-muted-foreground">
                          {formatDate(score.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-muted-foreground text-center py-8">
                  No games played yet. Start a game to track your progress!
                </p>
              )}
            </NeonCard>
          </div>
        </div>
      </main>

      {/* Ambient glow effects */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 bg-neon-magenta/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Profile;
