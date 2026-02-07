import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Grid3X3, Calculator, Zap, Type, Trophy, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import NeonCard from '@/components/ui/NeonCard';
import { getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  variant: 'cyan' | 'magenta' | 'lime' | 'orange' | 'purple';
  path: string;
  gameId: string;
  skills: string[];
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon: Icon,
  variant,
  path,
  gameId,
  skills,
}) => {
  const navigate = useNavigate();
  const bestScore = getBestScore(gameId);

  const iconColors = {
    cyan: 'text-neon-cyan',
    magenta: 'text-neon-magenta',
    lime: 'text-neon-lime',
    orange: 'text-neon-orange',
    purple: 'text-neon-purple',
  };

  const handleClick = () => {
    soundManager.play('click');
    navigate(path);
  };

  return (
    <NeonCard
      variant={variant}
      className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="relative">
          <Icon className={`w-12 h-12 ${iconColors[variant]} transition-transform duration-300 group-hover:scale-110`} />
          <div className={`absolute inset-0 blur-lg ${iconColors[variant]} opacity-30 group-hover:opacity-50 transition-opacity`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            {title}
          </h3>
          <p className="font-body text-muted-foreground text-sm mb-3">
            {description}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 rounded-full text-xs font-body bg-muted/50 text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>

          {bestScore > 0 && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-neon-yellow" />
              <span className="font-body text-sm text-neon-yellow">
                Best: {bestScore}
              </span>
            </div>
          )}
        </div>
      </div>
    </NeonCard>
  );
};

const Dashboard: React.FC = () => {
  const games: GameCardProps[] = [
    {
      title: 'BrainMaze',
      description: 'Navigate through logic puzzles to unlock maze paths and reach the goal.',
      icon: Map,
      variant: 'cyan',
      path: '/games/brainmaze',
      gameId: 'brainmaze',
      skills: ['Logic', 'Problem Solving', 'Planning'],
    },
    {
      title: 'MemoryFlip+',
      description: 'Match pairs of cards to test and improve your memory skills.',
      icon: Grid3X3,
      variant: 'magenta',
      path: '/games/memoryflip',
      gameId: 'memoryflip',
      skills: ['Memory', 'Concentration', 'Pattern Recognition'],
    },
    {
      title: 'ThinkFast',
      description: 'Race against time to solve math and logic challenges.',
      icon: Calculator,
      variant: 'lime',
      path: '/games/thinkfast',
      gameId: 'thinkfast',
      skills: ['Math', 'Speed', 'Accuracy'],
    },
    {
      title: 'ReflexIQ',
      description: 'Test your reaction speed with quick visual challenges.',
      icon: Zap,
      variant: 'orange',
      path: '/games/reflexiq',
      gameId: 'reflexiq',
      skills: ['Reflexes', 'Attention', 'Focus'],
    },
    {
      title: 'WordBend',
      description: 'Decode distorted and reversed words in this visual puzzle.',
      icon: Type,
      variant: 'purple',
      path: '/games/wordbend',
      gameId: 'wordbend',
      skills: ['Language', 'Visual Processing', 'Recognition'],
    },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      <Header />
      
      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold neon-text-cyan mb-4">
              Choose Your Challenge
            </h1>
            <p className="font-body text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a game to start training your brain. Each game targets different cognitive skills.
            </p>
          </div>

          {/* Daily Challenge Banner */}
          <NeonCard variant="lime" className="mb-8 relative overflow-hidden" hover={false}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-neon-lime/20">
                <Star className="w-8 h-8 text-neon-lime" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-neon-lime">
                  Daily Challenge
                </h2>
                <p className="font-body text-muted-foreground">
                  Complete all 5 games today to earn bonus points!
                </p>
              </div>
            </div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-neon-lime/10 rounded-full blur-2xl" />
          </NeonCard>

          {/* Game Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <div
                key={game.gameId}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
                <GameCard {...game} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Ambient glow effects */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 bg-neon-magenta/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default Dashboard;
