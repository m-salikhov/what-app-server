import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SiService } from './si.service';
import { JoinDto } from './dto/join.dto';
import { nanoid } from 'nanoid';

@WebSocketGateway()
export class SiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly siService: SiService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // клиент посылает свой userid из localstorage
    // headers только для разработки
    let userId =
      client.handshake.auth.userid || client.handshake.headers.userid;

    if (!userId || userId.length !== 12) userId = nanoid(12);

    client.data.userId = userId;

    console.log('Client connected:', client.data);
    client.emit('on-auth', { userId });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.data);

    const result = this.siService.leave(client);

    client.broadcast.to(result.roomId).emit('on-user-leaved', {
      userId: result.userId,
      roomId: result.roomId,
      message: 'Участник вышел из комнаты',
    });
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('username') username: string,
  ): void {
    const result = this.siService.createRoom(client, username);

    // Отправляем клиенту событие с созданным ID комнаты
    client.emit('on-room-created', result);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody('data') data: JoinDto,
    @ConnectedSocket() client: Socket,
  ) {
    const result = this.siService.join(client, data);

    // Отправляем клиенту событие
    client.emit('on-room-joined', result);

    // Отправляем всем клиентам в комнате событие в случае успешного присоединения
    if (result.success)
      client.broadcast.to(data.roomId).emit('on-user-joined', {
        userId: result.userId,
        roomId: result.roomId,
        username: data.username,
        message: 'Пользователь присоединился к комнате',
      });
  }

  // @SubscribeMessage('leave-room')
  // handleLeaveRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody('roomId') roomId: string,
  // ) {
  //   const result = this.siService.leave(client, roomId);

  //   // Отправляем клиенту событие
  //   client.emit('on-room-leaved', result);

  //   // Отправляем всем клиентам в комнате событие
  //   if (result.success)
  //     this.server.to(roomId).emit('on-user-leaved', {
  //       userId: client.id,
  //       message: `Пользователь вышел из комнаты ${roomId}`,
  //     });
  // }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): any {
    console.log('Received message:', client.rooms);

    client.broadcast.emit('response', 'Hello world!');
  }
}
