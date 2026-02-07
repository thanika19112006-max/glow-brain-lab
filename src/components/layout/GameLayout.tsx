import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import NeonButton from '../ui/NeonButton';

interface GameLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta' | 'lime' | 'orange' | 'purple';
}

const GameLayout: React.FC<GameLayoutProps> = ({
  title,
  subtitle,
  children,
  variant = 'cyan',
}) => {
  const navigate = useNavigate();

  const titleColors = {
    cyan: 'neon-text-cyan',
    magenta: 'neon-text-magenta',
    lime: 'text-neon-lime',
    orange: 'text-neon-orange',
    purple: 'text-neon-purple',
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-hidden">
      <Header />
      
      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <NeonButton
              variant={variant}
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </NeonButton>
            
            <div>
              <h1 className={`font-display text-3xl md:text-4xl font-bold ${titleColors[variant]}`}>
                {title}
              </h1>
              {subtitle && (
                <p className="font-body text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {children}
        </div>
      </main>

      {/* Ambient glow effects */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-64 h-64 bg-neon-magenta/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default GameLayout;
