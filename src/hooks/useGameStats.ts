import { useLocalStorage } from './useLocalStorage';

export interface GameStats {
  totalMatches: number;
  teamWins: { [teamName: string]: number };
  matchHistory: MatchRecord[];
}

export interface MatchRecord {
  id: string;
  date: string;
  teams: Array<{
    name: string;
    finalScore: number;
    players: string[];
    roundScores: number[];
  }>;
  winner: string;
  rounds: number;
}

export function useGameStats() {
  const [stats, setStats] = useLocalStorage<GameStats>('decode-game-stats', {
    totalMatches: 0,
    teamWins: {},
    matchHistory: []
  });

  const recordMatchResult = (matchResult: Omit<MatchRecord, 'id' | 'date'>) => {
    const newMatch: MatchRecord = {
      ...matchResult,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };

    setStats(prevStats => ({
      totalMatches: prevStats.totalMatches + 1,
      teamWins: {
        ...prevStats.teamWins,
        [matchResult.winner]: (prevStats.teamWins[matchResult.winner] || 0) + 1
      },
      matchHistory: [newMatch, ...prevStats.matchHistory].slice(0, 10) // Manter apenas os últimos 10 jogos
    }));
  };

  const getTeamWins = (teamName: string): number => {
    return stats.teamWins[teamName] || 0;
  };

  const resetStats = () => {
    setStats({
      totalMatches: 0,
      teamWins: {},
      matchHistory: []
    });
  };

  return {
    stats,
    recordMatchResult,
    getTeamWins,
    resetStats
  };
}
