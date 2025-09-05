import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Room, User } from './Types/room.type';
import { nanoid } from 'nanoid';
import { JoinDto } from './dto/join.dto';

//уникальный идентификатор, который генерируется для каждого участника, если его ещё не было.
// хранится на клиенте в LS.
type UserId = string;

//id комнаты
type RoomId = string;

@Injectable()
export class SiService {
  //только для генерации уникального идентификатора комнаты
  private usedRoomIds = new Set<RoomId>();
  //список комнат
  private rooms = new Map<RoomId, Room>();
  //для хранения активной комнаты
  private clientActiveRoom = new Map<UserId, RoomId>();

  createRoom(owner: Socket, username: string) {
    // может быть только одна активная комната
    if (owner.rooms.size > 1) {
      return { success: false, message: 'Вы уже находитесь в другой комнате' };
    }

    const userId: UserId = owner.data.userId;

    // const roomId = this.generateRoomId();
    //для отладки
    const roomId = '3333';

    owner.data.roomId = roomId;

    const user: User = {
      username,
      socket: owner,
      score: 0,
      scoreHistory: [],
      isConnected: true,
      isOwner: true,
    };

    const users = new Map<UserId, User>([[userId, user]]);

    const newRoom: Room = {
      users,
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

    if (client.rooms.size > 1) {
      return {
        success: false,
        message: 'Вы уже находитесь в другой комнате',
      };
    }

    if (this.rooms.get(roomId).users.has(userId)) {
      const isConnected = this.rooms.get(roomId).users.get(userId).isConnected;

      if (isConnected) {
        return {
          success: false,
          message: 'Игрок уже в комнате',
        };
      } else {
        this.rooms.get(roomId).users.get(userId).isConnected = true;
        client.data.roomId = roomId;
        return {
          success: true,
          message: 'Игрок переподключился',
        };
      }
    }

    // const check = this.handleActiveRoom(userId, roomId);

    const user: User = {
      username,
      socket: client,
      score: 0,
      scoreHistory: [],
      isConnected: true,
      isOwner: false,
    };

    // добавляем клиента в комнату
    this.rooms.get(roomId).users.set(userId, user);

    // запоминаем активную комнату клиента
    this.clientActiveRoom.set(userId, roomId);
    // подписываем клиента на события комнаты
    client.join(roomId);
    client.data.roomId = roomId;

    return {
      roomId,
      userId,
      success: true,
      message: 'Вы присоединились к комнате',
    };
  }

  leave(client: Socket) {
    const userId = client.data.userId;
    const roomId = client.data.roomId;

    // удаляем клиента из комнаты
    client.leave(roomId);
    // удаляем активную комнату
    this.clientActiveRoom.delete(userId);

    // переводим игрока в неактивное состояние, но сохраняем на случай повторного входа
    const player = this.rooms.get(roomId).users.get(userId);
    player.isConnected = false;

    // console.log(this.rooms.size, this.rooms.get(roomId).users);

    return { userId, roomId, message: `Участник вышел из комнаты` };
  }

  generateRoomId(): string {
    let roomId: string;
    do {
      roomId = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.usedRoomIds.has(roomId));

    this.usedRoomIds.add(roomId);
    return roomId;
  }

  // handleActiveRoom(userId: UserId, roomId: RoomId) {
  //   const check = this.clientActiveRoom.has(userId);

  //   // если у пользователя нет активной комнаты
  //   if (!check) {
  //     return 'new';
  //   }

  //   const activeRoomId = this.clientActiveRoom.get(userId);
  //   const room = this.rooms.get(activeRoomId);
  //   const player = room.players.get(userId);

  //   // если пользователь в активной комнате
  //   if (activeRoomId === roomId && player.isConnected) {
  //     return 'same';
  //   }

  //   // если пользователя выкинуло из активной комнаты
  //   if (activeRoomId === roomId && !player.isConnected) {
  //     player.isConnected = true;
  //     return 'reconnect';
  //   }

  //   // если пользователь в другой активной комнате
  //   if (activeRoomId !== roomId && !player.isConnected) {
  //     this.clientActiveRoom.delete(userId);
  //     player.isConnected = true;
  //     return 'rejoin';
  //   }

  //   // если у пользователь уже есть активная комната
  //   // помечаем его как неактивного, удаляем его из активных
  //   this.clientActiveRoom.delete(userId);

  //   if (room.owner.userId === userId) {
  //     room.owner.isConnected = false;
  //   } else {
  //     player.isConnected = false;
  //   }
  // }

  removeRoomId(roomId: string) {
    this.usedRoomIds.delete(roomId);
  }
}
