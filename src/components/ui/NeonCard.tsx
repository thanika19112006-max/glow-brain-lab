import React from 'react';
import { cn } from '@/lib/utils';

interface NeonCardProps {
  variant?: 'cyan' | 'magenta' | 'lime' | 'orange' | 'purple';
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

const NeonCard: React.FC<NeonCardProps> = ({
  variant = 'cyan',
  className,
  children,
  hover = true,
  onClick,
}) => {
  const variantStyles = {
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan hover:shadow-[0_0_30px_hsl(180_100%_50%/0.3)]',
    magenta: 'border-neon-magenta/30 hover:border-neon-magenta hover:shadow-[0_0_30px_hsl(320_100%_60%/0.3)]',
    lime: 'border-neon-lime/30 hover:border-neon-lime hover:shadow-[0_0_30px_hsl(120_100%_50%/0.3)]',
    orange: 'border-neon-orange/30 hover:border-neon-orange hover:shadow-[0_0_30px_hsl(30_100%_55%/0.3)]',
    purple: 'border-neon-purple/30 hover:border-neon-purple hover:shadow-[0_0_30px_hsl(270_100%_65%/0.3)]',
  };

  const staticVariantStyles = {
    cyan: 'border-neon-cyan/30',
    magenta: 'border-neon-magenta/30',
    lime: 'border-neon-lime/30',
    orange: 'border-neon-orange/30',
    purple: 'border-neon-purple/30',
  };

  return (
    <div
      className={cn(
        'relative p-6 rounded-xl',
        'bg-card/80 backdrop-blur-md',
        'border-2 transition-all duration-300',
        hover ? variantStyles[variant] : staticVariantStyles[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default NeonCard;
