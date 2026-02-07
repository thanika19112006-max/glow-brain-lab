import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import NeonCard from '@/components/ui/NeonCard';
import NeonButton from '@/components/ui/NeonButton';
import { saveScore, getBestScore } from '@/lib/gameStorage';
import { soundManager } from '@/lib/soundManager';
import { Trophy, RotateCcw, Play } from 'lucide-react';

interface Cell {
  x: number;
  y: number;
  isPath: boolean;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isLocked: boolean;
  isUnlocked: boolean;
  isVisited: boolean;
  isCurrent: boolean;
}

interface Question {
  question: string;
  answer: number;
  options: number[];
}

const generateMaze = (level: number): Cell[][] => {
  const size = 5 + Math.min(level, 3);
  const maze: Cell[][] = [];
  
  for (let y = 0; y < size; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < size; x++) {
      row.push({
        x, y,
        isPath: false,
        isWall: false,
        isStart: x === 0 && y === 0,
        isEnd: x === size - 1 && y === size - 1,
        isLocked: false,
        isUnlocked: false,
        isVisited: x === 0 && y === 0,
        isCurrent: x === 0 && y === 0,
      });
    }
    maze.push(row);
  }

  // Create a valid path from start to end
  let currentX = 0;
  let currentY = 0;
  const path: [number, number][] = [[0, 0]];
  
  while (currentX < size - 1 || currentY < size - 1) {
    const canMoveRight = currentX < size - 1;
    const canMoveDown = currentY < size - 1;
    
    if (canMoveRight && canMoveDown) {
      if (Math.random() > 0.5) {
        currentX++;
      } else {
        currentY++;
      }
    } else if (canMoveRight) {
      currentX++;
    } else {
      currentY++;
    }
    path.push([currentX, currentY]);
    maze[currentY][currentX].isPath = true;
  }

  // Add some locked gates along the path
  const lockedCount = Math.min(2 + level, path.length - 2);
  const lockedPositions = new Set<number>();
  while (lockedPositions.size < lockedCount) {
    const pos = Math.floor(Math.random() * (path.length - 2)) + 1;
    lockedPositions.add(pos);
  }

  lockedPositions.forEach(pos => {
    const [x, y] = path[pos];
    maze[y][x].isLocked = true;
  });

  // Add some walls
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!maze[y][x].isPath && !maze[y][x].isStart && !maze[y][x].isEnd) {
        maze[y][x].isWall = Math.random() > 0.3;
      }
    }
  }

  return maze;
};

const generateQuestion = (level: number): Question => {
  const difficulty = Math.min(level, 5);
  let question: string;
  let answer: number;

  const type = Math.floor(Math.random() * 4);
  
  switch (type) {
    case 0: { // Addition
      const a = Math.floor(Math.random() * (10 + difficulty * 5)) + 1;
      const b = Math.floor(Math.random() * (10 + difficulty * 5)) + 1;
      question = `${a} + ${b} = ?`;
      answer = a + b;
      break;
    }
    case 1: { // Subtraction
      const a = Math.floor(Math.random() * (20 + difficulty * 5)) + 10;
      const b = Math.floor(Math.random() * a) + 1;
      question = `${a} - ${b} = ?`;
      answer = a - b;
      break;
    }
    case 2: { // Multiplication
      const a = Math.floor(Math.random() * (5 + difficulty)) + 2;
      const b = Math.floor(Math.random() * (5 + difficulty)) + 2;
      question = `${a} × ${b} = ?`;
      answer = a * b;
      break;
    }
    default: { // Logic sequence
      const start = Math.floor(Math.random() * 5) + 1;
      const step = Math.floor(Math.random() * 3) + 2;
      question = `Sequence: ${start}, ${start + step}, ${start + step * 2}, ?`;
      answer = start + step * 3;
    }
  }

  // Generate wrong options
  const options = [answer];
  while (options.length < 4) {
    const wrong = answer + (Math.floor(Math.random() * 10) - 5);
    if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
      options.push(wrong);
    }
  }
  
  return { question, answer, options: options.sort(() => Math.random() - 0.5) };
};

const BrainMaze: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'question' | 'won' | 'lost'>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [lockedCell, setLockedCell] = useState<{ x: number; y: number } | null>(null);
  const bestScore = getBestScore('brainmaze');

  const startGame = useCallback(() => {
    const newMaze = generateMaze(level);
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setGameState('playing');
    setScore(0);
    soundManager.play('click');
  }, [level]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    if (newX < 0 || newX >= maze[0].length || newY < 0 || newY >= maze.length) return;

    const targetCell = maze[newY][newX];

    if (targetCell.isWall) {
      soundManager.play('error');
      return;
    }

    if (targetCell.isLocked && !targetCell.isUnlocked) {
      setLockedCell({ x: newX, y: newY });
      setCurrentQuestion(generateQuestion(level));
      setGameState('question');
      return;
    }

    // Move player
    const newMaze = maze.map(row => row.map(cell => ({
      ...cell,
      isCurrent: cell.x === newX && cell.y === newY,
      isVisited: cell.isVisited || (cell.x === newX && cell.y === newY),
    })));

    setMaze(newMaze);
    setPlayerPos({ x: newX, y: newY });
    soundManager.play('click');

    // Check win
    if (targetCell.isEnd) {
      const levelScore = level * 100 + 50;
      setScore(prev => prev + levelScore);
      soundManager.play('levelUp');
      setLevel(prev => prev + 1);
      setTimeout(() => {
        setGameState('won');
      }, 500);
    }
  }, [gameState, playerPos, maze, level]);

  const handleAnswer = (answer: number) => {
    if (!currentQuestion || !lockedCell) return;

    if (answer === currentQuestion.answer) {
      soundManager.play('success');
      setScore(prev => prev + 25);
      
      const newMaze = maze.map(row => row.map(cell => ({
        ...cell,
        isUnlocked: cell.isUnlocked || (cell.x === lockedCell.x && cell.y === lockedCell.y),
        isLocked: cell.x === lockedCell.x && cell.y === lockedCell.y ? false : cell.isLocked,
      })));
      
      setMaze(newMaze);
      setGameState('playing');
      setCurrentQuestion(null);
      setLockedCell(null);
    } else {
      soundManager.play('error');
      setCurrentQuestion(generateQuestion(level));
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': case 'w': handleMove(0, -1); break;
      case 'ArrowDown': case 's': handleMove(0, 1); break;
      case 'ArrowLeft': case 'a': handleMove(-1, 0); break;
      case 'ArrowRight': case 'd': handleMove(1, 0); break;
    }
  }, [handleMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const continueGame = () => {
    startGame();
  };

  const endGame = () => {
    saveScore('brainmaze', score, level - 1);
    setGameState('menu');
    setLevel(1);
  };

  return (
    <GameLayout title="BrainMaze" subtitle="Solve logic puzzles to unlock the path" variant="cyan">
      {gameState === 'menu' && (
        <NeonCard variant="cyan" hover={false} className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Logic Path Challenge
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Navigate through the maze! Some paths are locked - solve logic questions to open them.
            Use arrow keys or WASD to move.
          </p>
          {bestScore > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-neon-yellow" />
              <span className="font-body text-neon-yellow">Best Score: {bestScore}</span>
            </div>
          )}
          <NeonButton variant="cyan" size="lg" onClick={startGame}>
            <Play className="w-5 h-5 mr-2" />
            Start Game
          </NeonButton>
        </NeonCard>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="font-display text-lg">
              Level: <span className="text-neon-cyan">{level}</span>
            </div>
            <div className="font-display text-lg">
              Score: <span className="text-neon-lime">{score}</span>
            </div>
          </div>

          <NeonCard variant="cyan" hover={false} className="p-4">
            <div 
              className="grid gap-1 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${maze[0]?.length || 5}, 1fr)`,
                maxWidth: `${(maze[0]?.length || 5) * 50}px`
              }}
            >
              {maze.flat().map((cell) => (
                <div
                  key={`${cell.x}-${cell.y}`}
                  onClick={() => {
                    const dx = cell.x - playerPos.x;
                    const dy = cell.y - playerPos.y;
                    if (Math.abs(dx) + Math.abs(dy) === 1) {
                      handleMove(dx, dy);
                    }
                  }}
                  className={`
                    w-10 h-10 rounded-md flex items-center justify-center cursor-pointer
                    transition-all duration-300 text-xl font-bold
                    ${cell.isWall ? 'bg-muted/50 border border-border' : ''}
                    ${cell.isStart ? 'bg-neon-lime/30 border-2 border-neon-lime shadow-[0_0_10px_hsl(120_100%_50%/0.3)]' : ''}
                    ${cell.isEnd ? 'bg-neon-magenta/30 border-2 border-neon-magenta shadow-[0_0_10px_hsl(320_100%_60%/0.3)]' : ''}
                    ${cell.isLocked && !cell.isUnlocked ? 'bg-neon-orange/30 border-2 border-neon-orange' : ''}
                    ${cell.isUnlocked ? 'bg-neon-cyan/20 border border-neon-cyan/50' : ''}
                    ${cell.isCurrent ? 'bg-neon-cyan border-2 border-neon-cyan shadow-[0_0_20px_hsl(180_100%_50%/0.5)]' : ''}
                    ${cell.isVisited && !cell.isCurrent && !cell.isStart ? 'bg-neon-cyan/10' : ''}
                    ${!cell.isWall && !cell.isLocked && !cell.isStart && !cell.isEnd && !cell.isVisited ? 'bg-card/50 border border-border/30 hover:bg-card' : ''}
                  `}
                >
                  {cell.isCurrent && '●'}
                  {cell.isStart && !cell.isCurrent && 'S'}
                  {cell.isEnd && '★'}
                  {cell.isLocked && !cell.isUnlocked && '🔒'}
                </div>
              ))}
            </div>
          </NeonCard>

          <p className="font-body text-center text-muted-foreground">
            Use arrow keys or click adjacent cells to move
          </p>
        </div>
      )}

      {gameState === 'question' && currentQuestion && (
        <NeonCard variant="orange" hover={false} className="text-center">
          <h2 className="font-display text-xl font-bold text-neon-orange mb-6">
            🔒 Solve to Unlock
          </h2>
          <p className="font-display text-2xl text-foreground mb-8">
            {currentQuestion.question}
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {currentQuestion.options.map((option) => (
              <NeonButton
                key={option}
                variant="cyan"
                onClick={() => handleAnswer(option)}
              >
                {option}
              </NeonButton>
            ))}
          </div>
        </NeonCard>
      )}

      {gameState === 'won' && (
        <NeonCard variant="lime" hover={false} className="text-center">
          <h2 className="font-display text-3xl font-bold text-neon-lime mb-4">
            🎉 Level Complete!
          </h2>
          <p className="font-body text-xl text-foreground mb-2">
            Current Score: <span className="text-neon-lime">{score}</span>
          </p>
          <p className="font-body text-muted-foreground mb-6">
            Ready for Level {level}?
          </p>
          <div className="flex gap-4 justify-center">
            <NeonButton variant="cyan" onClick={continueGame}>
              <Play className="w-4 h-4 mr-2" />
              Continue
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

export default BrainMaze;
