import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../../api/chat/models';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { SocketData } from './models/socket-data';
import { SocketEnum } from './socket.enum';
import { RemoteSocket } from 'socket.io/dist/broadcast-operator';

export default class SocketService {
  public static instance: SocketService;
  public static io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>;

  constructor(server: HTTPServer) {
    SocketService.instance = this;
    SocketService.io = new Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: { origin: '*' },
    });

    SocketService.io.on('connect', (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => this.onConnect(socket));
  }

  public static async send<T>(type: string, data: T, senderId: string, chatId?: string): Promise<Array<string>> {
    this.broadcast<T>({ type, data, chatId: chatId?.toString() || null, senderId });
    const sockets = await this.io.fetchSockets();

    return chatId
      ? sockets.reduce((map: Array<string>, { data, rooms }) => (data.uid && rooms.has(chatId.toString()) ? [...map, data.uid] : map), [])
      : sockets.map(({ data }) => data.uid!);
  }

  public static sendUpdate(data: Record<string, any>, senderId: string): void {
    this.io.emit(SocketEnum.SEND_UPDATE, data, { byId: senderId });
  }

  public static sendMessage(data: ChatMessage, chatId: string | null, senderId: string): void {
    this.broadcast<ChatMessage>({ type: SocketEnum.SEND_MESSAGE, data, chatId, senderId });
  }

  public static deleteMessage(index: number, chatId: string, senderId: string): void {
    this.broadcast<{ index: number }>({ type: SocketEnum.DELETE_MESSAGE, data: { index }, chatId, senderId });
  }

  public static async sendTo(userId: string, data: Record<string, any>): Promise<void> {
    const socket = await this.getUserSocket(userId);

    if (!socket) {
      return;
    }

    socket.emit(SocketEnum.DIRECT_MESSAGE, data);
  }

  private static broadcast<T>(payload: { type: string; data: T; chatId: string | null; senderId: string }): void {
    const { type, data, chatId = null, senderId } = payload;

    if (chatId) {
      this.io.to(chatId).emit(type, data, { chatId, byId: senderId });
    } else {
      this.io.emit(type, data, { byId: senderId });
    }
  }

  public static async getUserSocket(userId: string): Promise<RemoteSocket<DefaultEventsMap, SocketData> | void> {
    const sockets = await this.io.fetchSockets();

    return sockets.find(({ data }) => data.uid === userId.toString());
  }

  public static async isInChat(userId: string, chatId: string): Promise<boolean> {
    const socket = await this.getUserSocket(userId.toString());

    return !!socket?.rooms.has(chatId.toString());
  }

  private config(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>, uid?: string): void {
    socket.data.uid = uid;

    if (uid) {
      socket.join(uid);
    }
  }

  private join(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>, chatId: string | Array<string>): void {
    (Array.isArray(chatId) ? chatId : [chatId]).forEach((id) => socket.join(id));
  }

  private leave(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>, chatId: string | Array<string>): void {
    (Array.isArray(chatId) ? chatId : [chatId]).forEach((id) => socket.leave(id));
  }

  private onConnect = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
    socket.on(SocketEnum.LEAVE_CHAT, (chatId: string | Array<string>) => this.leave(socket, chatId));
    socket.on(SocketEnum.JOIN_CHAT, (chatId: string | Array<string>) => this.join(socket, chatId));
    socket.on(SocketEnum.SETUP, (socketData: SocketData) => this.config(socket, socketData.uid));
    socket.on('disconnect', () => this.config(socket));
  };
}
