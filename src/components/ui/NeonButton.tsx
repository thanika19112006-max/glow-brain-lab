import React from 'react';
import { cn } from '@/lib/utils';
import { soundManager } from '@/lib/soundManager';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'magenta' | 'lime' | 'orange' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  variant = 'cyan',
  size = 'md',
  children,
  className,
  onClick,
  ...props
}) => {
  const variantStyles = {
    cyan: 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_30px_hsl(180_100%_50%/0.5)]',
    magenta: 'border-neon-magenta text-neon-magenta hover:bg-neon-magenta/20 hover:shadow-[0_0_30px_hsl(320_100%_60%/0.5)]',
    lime: 'border-neon-lime text-neon-lime hover:bg-neon-lime/20 hover:shadow-[0_0_30px_hsl(120_100%_50%/0.5)]',
    orange: 'border-neon-orange text-neon-orange hover:bg-neon-orange/20 hover:shadow-[0_0_30px_hsl(30_100%_55%/0.5)]',
    purple: 'border-neon-purple text-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_30px_hsl(270_100%_65%/0.5)]',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.play('click');
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'relative font-display font-semibold tracking-wider uppercase',
        'border-2 rounded-lg',
        'transition-all duration-300 ease-out',
        'backdrop-blur-sm bg-background/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default NeonButton;
