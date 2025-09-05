import { Socket } from 'socket.io';

//уникальный идентификатор, который генерируется для каждого участника, если его ещё не было.
// хранится на клиенте в LS.
type UserId = string;

export interface User {
  socket: Socket;
  username: string;
  score: number;
  // Score history - [номер темы, очки].
  scoreHistory: [number, number][];
  isOwner: boolean;
  isConnected: boolean;
}

export type Room = {
  users: Map<UserId, User>;
  gameState: {
    subjectNumber: number;
    timerSeconds: number;
  };
};
