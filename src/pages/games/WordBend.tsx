import React, { useState, useEffect } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { saveScore, getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';
import { Trophy, Play, Eye, Clock, Check, X } from 'lucide-react';

const WORDS = [
  'BRAIN', 'THINK', 'SMART', 'QUICK', 'FOCUS', 'LOGIC', 'PUZZLE', 'MEMORY',
  'SPEED', 'REFLEX', 'LEARN', 'SHARP', 'CLEVER', 'GENIUS', 'MASTER', 'EXPERT',
  'VISION', 'POWER', 'SKILL', 'BOOST', 'LEVEL', 'SCORE', 'WINNER', 'CHAMPION'
];

type DistortionType = 'reversed' | 'upsideDown' | 'scattered' | 'wavy' | 'mixed';

interface Challenge {
  word: string;
  distortion: DistortionType;
  displayWord: string;
  options: string[];
}

const applyDistortion = (word: string, type: DistortionType): string => {
  switch (type) {
    case 'reversed':
      return word.split('').reverse().join('');
    case 'upsideDown':
      const upsideDownMap: Record<string, string> = {
        'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ',
        'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥',
        'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ',
        'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
        'Y': '⅄', 'Z': 'Z'
      };
      return word.split('').map(c => upsideDownMap[c] || c).reverse().join('');
    case 'scattered':
      return word.split('').map((c, i) => i % 2 === 0 ? c : ` ${c} `).join('');
    case 'wavy':
      return word.split('').map((c, i) => 
        i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
      ).join('');
    case 'mixed':
      const chars = word.split('');
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }
      return chars.join('');
    default:
      return word;
  }
};

const generateChallenge = (level: number): Challenge => {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  
  const distortions: DistortionType[] = ['reversed', 'scattered', 'wavy'];
  if (level >= 2) distortions.push('upsideDown');
  if (level >= 3) distortions.push('mixed');
  
  const distortion = distortions[Math.floor(Math.random() * distortions.length)];
  const displayWord = applyDistortion(word, distortion);
  
  // Generate wrong options
  const options = [word];
  const availableWords = WORDS.filter(w => w !== word);
  while (options.length < 4) {
    const wrongWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    if (!options.includes(wrongWord)) {
      options.push(wrongWord);
    }
  }
  
  return {
    word,
    distortion,
    displayWord,
    options: options.sort(() => Math.random() - 0.5),
  };
};

const WordBend: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const bestScore = getBestScore('wordbend');
  const roundsPerLevel = 5;

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setLives(3);
    setRound(0);
    setTimeLeft(10);
    setChallenge(generateChallenge(1));
    setGameState('playing');
    soundManager.play('click');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleAnswer('');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (!challenge || gameState !== 'playing') return;

    if (answer === challenge.word) {
      soundManager.play('success');
      const timeBonus = timeLeft * 2;
      const levelBonus = level * 5;
      setScore(s => s + 20 + timeBonus + levelBonus);
      setFeedback('correct');
    } else {
      soundManager.play('error');
      setLives(l => l - 1);
      setFeedback('wrong');
      
      if (lives <= 1) {
        setTimeout(() => {
          soundManager.play('gameOver');
          saveScore('wordbend', score, level);
          setGameState('ended');
        }, 500);
        return;
      }
    }

    setTimeout(() => {
      setFeedback(null);
      const newRound = round + 1;
      setRound(newRound);

      if (newRound >= roundsPerLevel * level) {
        // Level up
        soundManager.play('levelUp');
        setLevel(l => l + 1);
      }

      setTimeLeft(Math.max(5, 10 - level));
      setChallenge(generateChallenge(level));
    }, 500);
  };

  const getDistortionName = (type: DistortionType) => {
    const names: Record<DistortionType, string> = {
      reversed: 'Reversed',
      upsideDown: 'Upside Down',
      scattered: 'Scattered',
      wavy: 'Wavy Case',
      mixed: 'Scrambled',
    };
    return names[type];
  };

  return (
    <GameLayout title="WordBend" subtitle="Decode distorted words" variant="purple">
      {gameState === 'menu' && (
        <NeonCard variant="purple" hover={false} className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Visual Word Puzzle
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Words will be shown reversed, scrambled, or distorted. 
            Identify the correct word before time runs out!
          </p>
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-neon-yellow" />
              <span className="font-body text-neon-yellow">Best Score: {bestScore}</span>
            </div>
          )}
          <NeonButton variant="purple" size="lg" onClick={startGame}>
            <Eye className="w-5 h-5 mr-2" />
            Start Game
          </NeonButton>
        </NeonCard>
      )}

      {gameState === 'playing' && challenge && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-4">
              <div className="font-display text-lg flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-destructive animate-pulse' : 'text-neon-purple'}`} />
                <span className={timeLeft <= 3 ? 'text-destructive' : 'text-neon-purple'}>{timeLeft}s</span>
              </div>
              <div className="font-display text-lg">
                Level: <span className="text-neon-lime">{level}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="font-display text-lg">
                Score: <span className="text-neon-cyan">{score}</span>
              </div>
              <div className="font-display text-lg flex items-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-xl ${i < lives ? 'text-destructive' : 'text-muted'}`}>
                    ♥
                  </span>
                ))}
              </div>
            </div>
          </div>

          <NeonCard 
            variant={feedback === 'correct' ? 'lime' : feedback === 'wrong' ? 'magenta' : 'purple'} 
            hover={false} 
            className="text-center"
          >
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-display uppercase bg-neon-purple/20 text-neon-purple">
                {getDistortionName(challenge.distortion)}
              </span>
            </div>

            <div className="relative py-8 mb-8">
              <p className={`
                font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-widest
                ${challenge.distortion === 'upsideDown' ? 'rotate-180' : ''}
                ${challenge.distortion === 'wavy' ? 'italic' : ''}
                text-foreground
              `}>
                {challenge.displayWord}
              </p>
              
              {feedback === 'correct' && (
                <div className="absolute inset-0 flex items-center justify-center bg-neon-lime/20 rounded-lg">
                  <Check className="w-16 h-16 text-neon-lime" />
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 rounded-lg">
                  <X className="w-16 h-16 text-destructive" />
                </div>
              )}
            </div>

            <p className="font-body text-muted-foreground mb-4">
              What's the word?
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {challenge.options.map((option) => (
                <NeonButton
                  key={option}
                  variant="purple"
                  onClick={() => handleAnswer(option)}
                  disabled={feedback !== null}
                >
                  {option}
                </NeonButton>
              ))}
            </div>
          </NeonCard>
        </div>
      )}

      {gameState === 'ended' && (
        <NeonCard variant="purple" hover={false} className="text-center">
          <h2 className="font-display text-3xl font-bold text-neon-purple mb-4">
            Game Over!
          </h2>
          <div className="space-y-2 mb-6">
            <p className="font-display text-4xl text-foreground">
              Score: <span className="text-neon-purple">{score}</span>
            </p>
            <p className="font-body text-lg text-muted-foreground">
              Level reached: {level}
            </p>
            {score > bestScore && score > 0 && (
              <p className="font-display text-neon-yellow animate-pulse">
                🏆 New Best Score!
              </p>
            )}
          </div>
          <NeonButton variant="purple" size="lg" onClick={startGame}>
            <Play className="w-4 h-4 mr-2" />
            Play Again
          </NeonButton>
        </NeonCard>
      )}
    </GameLayout>
  );
};

export default WordBend;
