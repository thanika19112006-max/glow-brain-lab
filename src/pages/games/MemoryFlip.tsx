import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { saveScore, getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';
import { Trophy, RotateCcw, Play, Clock, MousePointer2 } from 'lucide-react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🧠', '⚡', '🎯', '🔮', '💎', '🌟', '🎪', '🎨', '🚀', '🌈', '🎭', '🎲'];

const generateCards = (pairCount: number): Card[] => {
  const selectedEmojis = EMOJIS.slice(0, pairCount);
  const cards: Card[] = [];
  
  selectedEmojis.forEach((emoji, index) => {
    cards.push({ id: index * 2, emoji, isFlipped: false, isMatched: false });
    cards.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false });
  });
  
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
};

const MemoryFlip: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won'>('menu');
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const bestScore = getBestScore('memoryflip');

  const getPairCount = (lvl: number) => Math.min(4 + lvl, 12);

  const startGame = useCallback(() => {
    const pairCount = getPairCount(level);
    setCards(generateCards(pairCount));
    setFlippedCards([]);
    setMoves(0);
    setTime(0);
    setGameState('playing');
    soundManager.play('click');
  }, [level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCardClick = (cardId: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    if (cards.find(c => c.id === cardId)?.isFlipped) return;
    if (cards.find(c => c.id === cardId)?.isMatched) return;

    soundManager.play('flip');
    
    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsChecking(true);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match!
        soundManager.play('match');
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          ));
          setFlippedCards([]);
          setIsChecking(false);

          // Check win
          const matchedCount = newCards.filter(c => c.isMatched || c.id === firstId || c.id === secondId).length;
          if (matchedCount === newCards.length) {
            soundManager.play('levelUp');
            setTimeout(() => setGameState('won'), 300);
          }
        }, 500);
      } else {
        // No match
        soundManager.play('error');
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const calculateScore = () => {
    const pairCount = getPairCount(level);
    const baseScore = pairCount * 50;
    const moveBonus = Math.max(0, (pairCount * 3 - moves) * 10);
    const timeBonus = Math.max(0, (120 - time) * 2);
    return baseScore + moveBonus + timeBonus + level * 25;
  };

  const continueGame = () => {
    setLevel(l => l + 1);
    startGame();
  };

  const endGame = () => {
    saveScore('memoryflip', calculateScore(), level);
    setGameState('menu');
    setLevel(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGridCols = () => {
    const count = cards.length;
    if (count <= 8) return 4;
    if (count <= 12) return 4;
    if (count <= 16) return 4;
    return 6;
  };

  return (
    <GameLayout title="MemoryFlip+" subtitle="Match pairs of cards to win" variant="magenta">
      {gameState === 'menu' && (
        <NeonCard variant="magenta" hover={false} className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Card Matching Challenge
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Flip cards to find matching pairs. Complete the game with fewer moves and faster time for higher scores!
          </p>
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-neon-yellow" />
              <span className="font-body text-neon-yellow">Best Score: {bestScore}</span>
            </div>
          )}
          <div className="mb-6">
            <p className="font-body text-sm text-muted-foreground mb-2">Starting Level</p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`w-10 h-10 rounded-lg font-display font-bold transition-all ${
                    level === l
                      ? 'bg-neon-magenta text-background'
                      : 'bg-muted/50 text-foreground hover:bg-muted'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <NeonButton variant="magenta" size="lg" onClick={startGame}>
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </NeonButton>
        </NeonCard>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-6">
              <div className="font-display text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-neon-cyan" />
                <span className="text-neon-cyan">{formatTime(time)}</span>
              </div>
              <div className="font-display text-lg flex items-center gap-2">
                <MousePointer2 className="w-5 h-5 text-neon-magenta" />
                <span className="text-neon-magenta">{moves} moves</span>
              </div>
            </div>
            <div className="font-display text-lg">
              Level: <span className="text-neon-lime">{level}</span>
            </div>
          </div>

          <NeonCard variant="magenta" hover={false} className="p-4">
            <div 
              className="grid gap-3 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
                maxWidth: `${getGridCols() * 80}px`
              }}
            >
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched || isChecking}
                  className={`
                    aspect-square rounded-xl text-3xl md:text-4xl
                    transition-all duration-300 transform
                    ${card.isFlipped || card.isMatched
                      ? 'bg-gradient-to-br from-neon-magenta/30 to-neon-purple/30 border-2 border-neon-magenta shadow-[0_0_20px_hsl(320_100%_60%/0.3)] scale-100'
                      : 'bg-card border-2 border-border hover:border-neon-magenta/50 hover:scale-105'
                    }
                    ${card.isMatched ? 'opacity-70' : ''}
                  `}
                  style={{
                    minWidth: '60px',
                    minHeight: '60px',
                  }}
                >
                  {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
                </button>
              ))}
            </div>
          </NeonCard>
        </div>
      )}

      {gameState === 'won' && (
        <NeonCard variant="lime" hover={false} className="text-center">
          <h2 className="font-display text-3xl font-bold text-neon-lime mb-4">
            🎉 Level Complete!
          </h2>
          <div className="space-y-2 mb-6">
            <p className="font-body text-lg text-foreground">
              Time: <span className="text-neon-cyan">{formatTime(time)}</span>
            </p>
            <p className="font-body text-lg text-foreground">
              Moves: <span className="text-neon-magenta">{moves}</span>
            </p>
            <p className="font-display text-2xl text-neon-lime">
              Score: {calculateScore()}
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <NeonButton variant="cyan" onClick={continueGame}>
              <Play className="w-4 h-4 mr-2" />
              Next Level
            </NeonButton>
            <NeonButton variant="magenta" onClick={endGame}>
              End & Save
            </NeonButton>
          </div>
        </NeonCard>
      )}
    </GameLayout>
  );
};

export default MemoryFlip;
