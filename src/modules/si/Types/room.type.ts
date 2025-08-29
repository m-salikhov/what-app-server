import { Socket } from 'socket.io';

//уникальный идентификатор, который генерируется для каждого участника, если его ещё не было.
// хранится на клиенте в LS.
type UserId = string;

interface Player {
  socket: Socket;
  username: string;
  score: number;
  // Score history - [номер темы, очки].
  scoreHistory: [number, number][];
  isConnected: boolean;
}

export type Room = {
  owner: { userId: UserId; socket: Socket; isConnected: boolean };
  players: Map<UserId, Player>;
  gameState: {
    subjectNumber: number;
    timerSeconds: number;
  };
};
