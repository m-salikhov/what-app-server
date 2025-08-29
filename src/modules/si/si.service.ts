import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Room } from './Types/room.type';
import { nanoid } from 'nanoid';
import { JoinDto } from './dto/join.dto';

//уникальный идентификатор, который генерируется для каждого участника, если его ещё не было.
// хранится на клиенте в LS.
type UserId = string;

//id комнаты
type RoomId = string;

@Injectable()
export class SiService {
  private usedRoomIds = new Set<RoomId>();
  private rooms = new Map<RoomId, Room>();
  private clientActiveRoom = new Map<UserId, RoomId>();

  createRoom(owner: Socket, userId: UserId) {
    const roomId = this.generateRoomId();

    if (userId) {
      this.handleActiveRoom(userId, roomId);
    }

    // генерируем уникальный идентификатор, который клиент сохранит в LS
    if (!userId) {
      userId = nanoid(12);
    }

    const newRoom: Room = {
      owner: { userId, socket: owner, isConnected: true },
      players: new Map(),
      gameState: { subjectNumber: 1, timerSeconds: 6 },
    };

    // добавляем комнату в список
    this.rooms.set(roomId, newRoom);

    // запоминаем активную комнату клиента
    this.clientActiveRoom.set(userId, roomId);

    // присоединяем клиента к комнате
    owner.join(roomId);

    return { roomId, userId, success: true, message: 'Комната создана' };
  }

  join(client: Socket, { userId, roomId, username }: JoinDto) {
    if (!this.rooms.has(roomId)) {
      return { success: false, message: 'Комната не существует' };
    }

    const check = this.handleActiveRoom(userId, roomId);

    // генерируем уникальный идентификатор, который клиент сохранит в LS
    if (!userId) {
      userId = nanoid(12);
    }

    const players = this.rooms.get(roomId).players;

    if (players.has(userId)) {
      return { success: false, message: 'Вы уже находитесь в этой комнате' };
    }

    const player = {
      username,
      socket: client,
      score: 0,
      scoreHistory: [],
      isConnected: true,
    };

    // добавляем клиента в комнату
    players.set(userId, player);
    // запоминаем активную комнату клиента
    this.clientActiveRoom.set(userId, roomId);
    // подписываем клиента на события комнаты
    client.join(roomId);

    console.log(
      this.rooms,
      this.rooms.get(roomId).players,
      this.clientActiveRoom,
    );

    return {
      roomId,
      userId,
      success: true,
      message: 'Вы присоединились к комнате',
    };
  }

  // leave(client: Socket, roomId: string) {
  //   // Проверяем, существует ли комната
  //   if (!this.rooms.has(roomId)) {
  //     return { success: false, message: 'Комната не существует' };
  //   }

  //   const room = this.rooms.get(roomId);

  //   // Проверяем, находится ли клиент в комнате
  //   if (!room.has(client)) {
  //     return {
  //       success: false,
  //       message: 'Пользователь не находится в этой комнате',
  //     };
  //   }

  //   // Удаляем клиента из комнаты
  //   room.delete(client);
  //   client.leave(roomId);

  //   // Если в комнате не осталось пользователей, удаляем комнату
  //   if (room.size === 0) {
  //     this.rooms.delete(roomId);
  //     this.usedRoomIds.delete(roomId);
  //   }

  //   return { success: true, message: `Вы покинули комнату ${roomId}` };
  // }

  generateRoomId(): string {
    let roomId: string;
    do {
      roomId = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.usedRoomIds.has(roomId));

    this.usedRoomIds.add(roomId);
    return roomId;
  }

  handleActiveRoom(userId: UserId, roomId: RoomId) {
    const check = this.clientActiveRoom.has(userId);

    // если у пользователя нет активной комнаты
    if (!check) {
      return 'new';
    }

    const activeRoomId = this.clientActiveRoom.get(userId);
    const room = this.rooms.get(activeRoomId);
    const player = room.players.get(userId);

    // если пользователь в активной комнате
    if (activeRoomId === roomId && player.isConnected) {
      return 'same';
    }

    // если пользователя выкинуло из активной комнаты
    if (activeRoomId === roomId && !player.isConnected) {
      player.isConnected = true;
      return 'reconnect';
    }

    // если пользователь в другой активной комнате
    if (activeRoomId !== roomId && !player.isConnected) {
      this.clientActiveRoom.delete(userId);
      player.isConnected = true;
      return 'rejoin';
    }

    // если у пользователь уже есть активная комната
    // помечаем его как неактивного, удаляем его из активных
    this.clientActiveRoom.delete(userId);

    if (room.owner.userId === userId) {
      room.owner.isConnected = false;
    } else {
      player.isConnected = false;
    }
  }

  removeRoomId(roomId: string) {
    this.usedRoomIds.delete(roomId);
  }
}
