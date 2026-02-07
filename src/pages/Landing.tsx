import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Zap, Target, Clock, Puzzle } from 'lucide-react';
import NeonButton from '@/components/ui/NeonButton';
import { getProfile } from '@/lib/gameStorage';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const profile = getProfile();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: Brain, text: 'Memory Training', color: 'text-neon-cyan' },
    { icon: Puzzle, text: 'Logic Puzzles', color: 'text-neon-magenta' },
    { icon: Zap, text: 'Quick Reflexes', color: 'text-neon-lime' },
    { icon: Target, text: 'Focus Games', color: 'text-neon-orange' },
    { icon: Clock, text: 'Speed Challenges', color: 'text-neon-purple' },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden flex flex-col items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo */}
        <div className={`mb-8 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative inline-block">
            <Brain className="w-24 h-24 md:w-32 md:h-32 text-neon-cyan mx-auto" />
            <div className="absolute inset-0 blur-xl bg-neon-cyan/30 animate-pulse" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-neon-magenta animate-bounce-subtle" />
          </div>
        </div>

        {/* Title */}
        <h1 
          className={`font-display text-4xl md:text-6xl lg:text-7xl font-black mb-4 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <span className="neon-text-cyan animate-glitch">Brain Boost</span>
        </h1>
        
        <p 
          className={`font-display text-xl md:text-2xl text-neon-magenta mb-8 transition-all duration-1000 delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Train Your Mind
        </p>

        {/* Feature icons */}
        <div 
          className={`flex flex-wrap justify-center gap-6 md:gap-8 mb-12 transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {features.map((feature, index) => (
            <div 
              key={feature.text}
              className="flex flex-col items-center gap-2 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <span className="font-body text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <NeonButton
            variant="cyan"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            {profile ? 'Continue Playing' : 'Start Training'}
          </NeonButton>
          
          {!profile && (
            <NeonButton
              variant="magenta"
              size="lg"
              onClick={() => navigate('/profile')}
            >
              Create Profile
            </NeonButton>
          )}
        </div>

        {/* Welcome back message */}
        {profile && (
          <p 
            className={`mt-6 font-body text-muted-foreground transition-all duration-1000 delay-1200 ${showContent ? 'opacity-100' : 'opacity-0'}`}
          >
            Welcome back, <span className="text-neon-cyan font-semibold">{profile.name}</span>!
          </p>
        )}
      </div>

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-20" />
    </div>
  );
};

export default Landing;
