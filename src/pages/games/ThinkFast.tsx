import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { saveScore, getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';
import { Trophy, Play, Clock, Target, Zap } from 'lucide-react';

interface Question {
  question: string;
  answer: number;
  options: number[];
  type: 'math' | 'logic';
}

const generateQuestion = (difficulty: number): Question => {
  const types = ['math', 'logic'] as const;
  const type = types[Math.floor(Math.random() * types.length)];
  
  let question: string;
  let answer: number;

  if (type === 'math') {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * Math.min(operations.length, 1 + difficulty))];
    
    switch (op) {
      case '+': {
        const a = Math.floor(Math.random() * (10 + difficulty * 10)) + 5;
        const b = Math.floor(Math.random() * (10 + difficulty * 10)) + 5;
        question = `${a} + ${b}`;
        answer = a + b;
        break;
      }
      case '-': {
        const a = Math.floor(Math.random() * (20 + difficulty * 10)) + 20;
        const b = Math.floor(Math.random() * 20) + 5;
        question = `${a} - ${b}`;
        answer = a - b;
        break;
      }
      case '×': {
        const a = Math.floor(Math.random() * (5 + difficulty * 2)) + 2;
        const b = Math.floor(Math.random() * (5 + difficulty * 2)) + 2;
        question = `${a} × ${b}`;
        answer = a * b;
        break;
      }
      default: {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        question = `${a} + ${b}`;
        answer = a + b;
      }
    }
  } else {
    // Logic questions
    const logicTypes = ['sequence', 'pattern', 'comparison'];
    const logicType = logicTypes[Math.floor(Math.random() * logicTypes.length)];
    
    switch (logicType) {
      case 'sequence': {
        const start = Math.floor(Math.random() * 5) + 1;
        const step = Math.floor(Math.random() * 4) + 2;
        question = `Next: ${start}, ${start + step}, ${start + step * 2}, ?`;
        answer = start + step * 3;
        break;
      }
      case 'pattern': {
        const base = Math.floor(Math.random() * 3) + 2;
        question = `Pattern: ${base}, ${base * 2}, ${base * 4}, ?`;
        answer = base * 8;
        break;
      }
      default: {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        question = `Which is larger? ${a} or ${b}`;
        answer = Math.max(a, b);
      }
    }
  }

  // Generate options
  const options = [answer];
  while (options.length < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
    const wrongAnswer = answer + offset;
    if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer);
    }
  }

  return {
    question,
    answer,
    options: options.sort(() => Math.random() - 0.5),
    type,
  };
};

const ThinkFast: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'ended'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [difficulty, setDifficulty] = useState(1);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const bestScore = getBestScore('thinkfast');

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    soundManager.play('click');
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        soundManager.play('countdown');
        setCountdown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setScore(0);
      setTimeLeft(30);
      setQuestionsAnswered(0);
      setStreak(0);
      setDifficulty(1);
      setCurrentQuestion(generateQuestion(1));
      setGameState('playing');
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      soundManager.play('gameOver');
      saveScore('thinkfast', score);
      setGameState('ended');
    }
  }, [gameState, timeLeft, score]);

  const handleAnswer = (answer: number) => {
    if (!currentQuestion || gameState !== 'playing') return;

    if (answer === currentQuestion.answer) {
      soundManager.play('success');
      const streakBonus = Math.floor(streak / 3) * 5;
      const points = 10 + streakBonus + difficulty * 2;
      setScore(s => s + points);
      setStreak(s => s + 1);
      setFeedback('correct');
      
      // Increase difficulty every 5 correct answers
      if ((questionsAnswered + 1) % 5 === 0) {
        setDifficulty(d => Math.min(d + 1, 5));
      }
    } else {
      soundManager.play('error');
      setStreak(0);
      setFeedback('wrong');
    }

    setQuestionsAnswered(q => q + 1);
    
    setTimeout(() => {
      setFeedback(null);
      setCurrentQuestion(generateQuestion(difficulty));
    }, 200);
  };

  const restartGame = () => {
    startGame();
  };

  return (
    <GameLayout title="ThinkFast" subtitle="Race against the clock" variant="lime">
      {gameState === 'menu' && (
        <NeonCard variant="lime" hover={false} className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Speed Math Challenge
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Answer as many math and logic questions as you can in 30 seconds! 
            Build streaks for bonus points.
          </p>
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-neon-yellow" />
              <span className="font-body text-neon-yellow">Best Score: {bestScore}</span>
            </div>
          )}
          <NeonButton variant="lime" size="lg" onClick={startGame}>
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </NeonButton>
        </NeonCard>
      )}

      {gameState === 'countdown' && (
        <NeonCard variant="lime" hover={false} className="text-center py-16">
          <p className="font-display text-8xl font-black text-neon-lime animate-pulse">
            {countdown}
          </p>
          <p className="font-body text-xl text-muted-foreground mt-4">Get Ready!</p>
        </NeonCard>
      )}

      {gameState === 'playing' && currentQuestion && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-6">
              <div className="font-display text-lg flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-neon-cyan'}`} />
                <span className={timeLeft <= 10 ? 'text-destructive' : 'text-neon-cyan'}>{timeLeft}s</span>
              </div>
              <div className="font-display text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-lime" />
                <span className="text-neon-lime">{score}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="font-display text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-orange" />
                <span className="text-neon-orange">×{streak}</span>
              </div>
            </div>
          </div>

          <NeonCard 
            variant={feedback === 'correct' ? 'lime' : feedback === 'wrong' ? 'magenta' : 'lime'} 
            hover={false} 
            className={`text-center transition-all duration-200 ${
              feedback === 'correct' ? 'scale-[1.02]' : 
              feedback === 'wrong' ? 'scale-[0.98]' : ''
            }`}
          >
            <div className="mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-display uppercase ${
                currentQuestion.type === 'math' 
                  ? 'bg-neon-cyan/20 text-neon-cyan' 
                  : 'bg-neon-purple/20 text-neon-purple'
              }`}>
                {currentQuestion.type}
              </span>
            </div>
            <p className="font-display text-3xl md:text-4xl text-foreground mb-8 py-4">
              {currentQuestion.question}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {currentQuestion.options.map((option, index) => (
                <NeonButton
                  key={`${option}-${index}`}
                  variant="cyan"
                  size="lg"
                  onClick={() => handleAnswer(option)}
                  className="text-xl"
                >
                  {option}
                </NeonButton>
              ))}
            </div>
          </NeonCard>

          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground">
              Questions answered: {questionsAnswered}
            </p>
          </div>
        </div>
      )}

      {gameState === 'ended' && (
        <NeonCard variant="lime" hover={false} className="text-center">
          <h2 className="font-display text-3xl font-bold text-neon-lime mb-4">
            ⏱️ Time's Up!
          </h2>
          <div className="space-y-2 mb-6">
            <p className="font-display text-4xl text-foreground">
              Score: <span className="text-neon-lime">{score}</span>
            </p>
            <p className="font-body text-lg text-muted-foreground">
              Questions: {questionsAnswered}
            </p>
            {score > bestScore && score > 0 && (
              <p className="font-display text-neon-yellow animate-pulse">
                🏆 New Best Score!
              </p>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <NeonButton variant="lime" size="lg" onClick={restartGame}>
              <Play className="w-4 h-4 mr-2" />
              Play Again
            </NeonButton>
          </div>
        </NeonCard>
      )}
    </GameLayout>
  );
};

export default ThinkFast;
