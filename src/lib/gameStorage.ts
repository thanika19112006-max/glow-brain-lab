// LocalStorage utilities for game data persistence

export interface UserProfile {
  name: string;
  createdAt: string;
}

export interface GameScore {
  game: string;
  score: number;
  date: string;
  level?: number;
}

export interface GameState {
  profile: UserProfile | null;
  scores: GameScore[];
  soundEnabled: boolean;
  lastPlayed: string | null;
}

const STORAGE_KEY = 'brainboost_data';

export const getGameState = (): GameState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading game state:', error);
  }
  return {
    profile: null,
    scores: [],
    soundEnabled: true,
    lastPlayed: null,
  };
};

export const saveGameState = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
};

export const saveProfile = (name: string): void => {
  const state = getGameState();
  state.profile = {
    name,
    createdAt: new Date().toISOString(),
  };
  saveGameState(state);
};

export const getProfile = (): UserProfile | null => {
  return getGameState().profile;
};

export const saveScore = (game: string, score: number, level?: number): void => {
  const state = getGameState();
  state.scores.push({
    game,
    score,
    date: new Date().toISOString(),
    level,
  });
  state.lastPlayed = game;
  saveGameState(state);
};

export const getBestScore = (game: string): number => {
  const state = getGameState();
  const gameScores = state.scores.filter(s => s.game === game);
  if (gameScores.length === 0) return 0;
  return Math.max(...gameScores.map(s => s.score));
};

export const getRecentScores = (limit: number = 10): GameScore[] => {
  const state = getGameState();
  return state.scores
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const toggleSound = (): boolean => {
  const state = getGameState();
  state.soundEnabled = !state.soundEnabled;
  saveGameState(state);
  return state.soundEnabled;
};

export const isSoundEnabled = (): boolean => {
  return getGameState().soundEnabled;
};

export const getAllBestScores = (): Record<string, number> => {
  const state = getGameState();
  const games = ['brainmaze', 'memoryflip', 'thinkfast', 'reflexiq', 'wordbend'];
  const bestScores: Record<string, number> = {};
  
  games.forEach(game => {
    bestScores[game] = getBestScore(game);
  });
  
  return bestScores;
};
