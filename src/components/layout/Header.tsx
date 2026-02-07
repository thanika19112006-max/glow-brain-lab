import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Volume2, VolumeX, User, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSoundEnabled, toggleSound } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';

const Header: React.FC = () => {
  const location = useLocation();
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) {
      soundManager.play('click');
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <Brain className="w-10 h-10 text-neon-cyan transition-all duration-300 group-hover:text-neon-magenta" />
            <div className="absolute inset-0 blur-md bg-neon-cyan/30 group-hover:bg-neon-magenta/30 transition-all duration-300" />
          </div>
          <span className="font-display text-xl font-bold neon-text-cyan hidden sm:block">
            Brain Boost
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {!isHome && (
            <Link
              to="/dashboard"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg',
                'border border-neon-cyan/30 text-foreground/80',
                'hover:border-neon-cyan hover:text-neon-cyan',
                'transition-all duration-300',
                'font-body text-sm'
              )}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </Link>
          )}

          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg',
              'border border-neon-magenta/30 text-foreground/80',
              'hover:border-neon-magenta hover:text-neon-magenta',
              'transition-all duration-300',
              'font-body text-sm'
            )}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <button
            onClick={handleSoundToggle}
            className={cn(
              'p-2 rounded-lg border transition-all duration-300',
              soundOn
                ? 'border-neon-lime/50 text-neon-lime hover:border-neon-lime'
                : 'border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground'
            )}
            aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
