import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { saveScore, getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';
import { Trophy, Play, Zap, AlertTriangle } from 'lucide-react';

type GamePhase = 'menu' | 'waiting' | 'ready' | 'clicked' | 'tooEarly' | 'results';

const ReflexIQ: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bestScore = getBestScore('reflexiq');
  const totalRounds = 5;

  const startGame = () => {
    setAttempts([]);
    setRound(0);
    setReactionTime(null);
    soundManager.play('click');
    startRound();
  };

  const startRound = () => {
    setPhase('waiting');
    setReactionTime(null);
    
    // Random delay between 1.5 and 5 seconds
    const delay = 1500 + Math.random() * 3500;
    
    // 20% chance of fake trigger (short flash that goes back to waiting)
    const hasFakeTrigger = Math.random() < 0.2;
    
    if (hasFakeTrigger) {
      const fakeDelay = 500 + Math.random() * 1500;
      setTimeout(() => {
        // Don't do fake trigger if already clicked
        if (phase === 'waiting') {
          // Just a visual flicker handled in CSS
        }
      }, fakeDelay);
    }
    
    timeoutRef.current = setTimeout(() => {
      setPhase('ready');
      setStartTime(Date.now());
      soundManager.play('countdown');
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'waiting') {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      soundManager.play('error');
      setPhase('tooEarly');
    } else if (phase === 'ready') {
      // Record reaction time
      const time = Date.now() - (startTime || Date.now());
      setReactionTime(time);
      setAttempts(prev => [...prev, time]);
      soundManager.play('success');
      setPhase('clicked');
    }
  };

  const nextRound = () => {
    const newRound = round + 1;
    setRound(newRound);
    
    if (newRound >= totalRounds) {
      // Game over
      const avgTime = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
      const score = Math.max(0, 1000 - avgTime);
      saveScore('reflexiq', score);
      setPhase('results');
    } else {
      startRound();
    }
  };

  const retryRound = () => {
    startRound();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPhaseColor = () => {
    switch (phase) {
      case 'waiting': return 'from-destructive/20 to-neon-orange/20 border-destructive/50';
      case 'ready': return 'from-neon-lime/30 to-accent/30 border-neon-lime';
      case 'clicked': return 'from-neon-cyan/20 to-primary/20 border-neon-cyan';
      case 'tooEarly': return 'from-neon-orange/20 to-destructive/20 border-neon-orange';
      default: return 'from-card to-muted border-border';
    }
  };

  const getAverageTime = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  const getReactionRating = (ms: number) => {
    if (ms < 200) return { text: 'Superhuman! 🦸', color: 'text-neon-lime' };
    if (ms < 250) return { text: 'Excellent! ⚡', color: 'text-neon-cyan' };
    if (ms < 300) return { text: 'Great! 🎯', color: 'text-neon-purple' };
    if (ms < 400) return { text: 'Good 👍', color: 'text-neon-yellow' };
    if (ms < 500) return { text: 'Average', color: 'text-foreground' };
    return { text: 'Keep practicing!', color: 'text-muted-foreground' };
  };

  return (
    <GameLayout title="ReflexIQ" subtitle="Test your reaction speed" variant="orange">
      {phase === 'menu' && (
        <NeonCard variant="orange" hover={false} className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Reaction Time Challenge
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Wait for the screen to turn <span className="text-neon-lime font-semibold">GREEN</span>, 
            then click as fast as you can! Don't click too early!
          </p>
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-neon-yellow" />
              <span className="font-body text-neon-yellow">Best Score: {bestScore}</span>
            </div>
          )}
          <NeonButton variant="orange" size="lg" onClick={startGame}>
            <Zap className="w-5 h-5 mr-2" />
            Start Test
          </NeonButton>
        </NeonCard>
      )}

      {(phase === 'waiting' || phase === 'ready') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-display text-lg">
              Round: <span className="text-neon-orange">{round + 1}/{totalRounds}</span>
            </span>
            {attempts.length > 0 && (
              <span className="font-display text-lg">
                Avg: <span className="text-neon-cyan">{getAverageTime()}ms</span>
              </span>
            )}
          </div>
          
          <div
            onClick={handleClick}
            className={`
              relative cursor-pointer rounded-2xl p-8 md:p-16 
              bg-gradient-to-br ${getPhaseColor()}
              border-4 transition-all duration-300
              min-h-[300px] flex items-center justify-center
              ${phase === 'ready' ? 'shadow-[0_0_60px_hsl(120_100%_50%/0.4)] animate-pulse' : ''}
            `}
          >
            {phase === 'waiting' && (
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4 animate-bounce" />
                <p className="font-display text-2xl text-destructive">WAIT...</p>
                <p className="font-body text-muted-foreground mt-2">
                  Don't click until it turns green!
                </p>
              </div>
            )}
            {phase === 'ready' && (
              <div className="text-center">
                <Zap className="w-20 h-20 text-neon-lime mx-auto mb-4" />
                <p className="font-display text-3xl text-neon-lime">CLICK NOW!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'clicked' && reactionTime !== null && (
        <NeonCard variant="cyan" hover={false} className="text-center">
          <Zap className="w-16 h-16 text-neon-cyan mx-auto mb-4" />
          <p className="font-display text-5xl font-black text-neon-cyan mb-2">
            {reactionTime}ms
          </p>
          <p className={`font-display text-xl ${getReactionRating(reactionTime).color} mb-6`}>
            {getReactionRating(reactionTime).text}
          </p>
          <NeonButton variant="cyan" size="lg" onClick={nextRound}>
            {round + 1 >= totalRounds ? 'See Results' : 'Next Round'}
          </NeonButton>
        </NeonCard>
      )}

      {phase === 'tooEarly' && (
        <NeonCard variant="orange" hover={false} className="text-center">
          <AlertTriangle className="w-16 h-16 text-neon-orange mx-auto mb-4" />
          <p className="font-display text-2xl text-neon-orange mb-2">
            Too Early!
          </p>
          <p className="font-body text-muted-foreground mb-6">
            You clicked before the screen turned green.
          </p>
          <NeonButton variant="orange" size="lg" onClick={retryRound}>
            Try Again
          </NeonButton>
        </NeonCard>
      )}

      {phase === 'results' && (
        <NeonCard variant="lime" hover={false} className="text-center">
          <h2 className="font-display text-3xl font-bold text-neon-lime mb-6">
            🏁 Test Complete!
          </h2>
          
          <div className="space-y-4 mb-8">
            <div>
              <p className="font-body text-muted-foreground">Average Reaction Time</p>
              <p className={`font-display text-5xl font-black ${getReactionRating(getAverageTime()).color}`}>
                {getAverageTime()}ms
              </p>
              <p className={`font-display text-lg ${getReactionRating(getAverageTime()).color}`}>
                {getReactionRating(getAverageTime()).text}
              </p>
            </div>
            
            <div className="flex gap-2 justify-center flex-wrap">
              {attempts.map((time, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-display bg-muted/50 text-foreground"
                >
                  {time}ms
                </span>
              ))}
            </div>

            <p className="font-display text-xl text-neon-yellow">
              Score: {Math.max(0, 1000 - getAverageTime())}
            </p>
            
            {Math.max(0, 1000 - getAverageTime()) > bestScore && bestScore > 0 && (
              <p className="font-display text-neon-yellow animate-pulse">
                🏆 New Best Score!
              </p>
            )}
          </div>
          
          <NeonButton variant="orange" size="lg" onClick={startGame}>
            <Zap className="w-4 h-4 mr-2" />
            Try Again
          </NeonButton>
        </NeonCard>
      )}
    </GameLayout>
  );
};

export default ReflexIQ;
