import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MonitoringService } from './monitoring.service';

@WebSocketGateway({
  namespace: 'monitoring',
  cors: {
    origin: '*',
  },
})
export class MonitoringGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly monitoringService: MonitoringService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (e) {
      console.error(`WebSocket Connection Error: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-exam')
  async handleJoinExam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { attemptId: string },
  ) {
    const { attemptId } = data;
    client.join(`exam-${attemptId}`);
    console.log(`User ${client.data.user.sub} joined exam room: exam-${attemptId}`);
  }

  @SubscribeMessage('join-admin-exam')
  async handleJoinAdminExam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string },
  ) {
    if (client.data.user.role !== 'ADMIN') return;
    const { examId } = data;
    client.join(`exam-admin-${examId}`);
    console.log(`Admin ${client.data.user.sub} joined admin room: exam-admin-${examId}`);
  }

  @SubscribeMessage('student-progress')
  async handleStudentProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { attemptId: string; lastQuestionId: string; examId: string },
  ) {
    // Notify admins in the exam-admin room
    this.server.to(`exam-admin-${data.examId}`).emit('student-updated', {
      attemptId: data.attemptId,
      lastQuestionId: data.lastQuestionId,
      userId: client.data.user.sub,
    });
    
    // Also notify the specific attempt room
    this.server.to(`exam-${data.attemptId}`).emit('student-updated', {
      attemptId: data.attemptId,
      lastQuestionId: data.lastQuestionId,
      userId: client.data.user.sub,
    });
  }

  @SubscribeMessage('student-focus-change')
  async handleFocusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { attemptId: string; eventType: 'FOCUS' | 'UNFOCUS'; examId: string },
  ) {
    // Save to DB
    await this.monitoringService.logActivity(data.attemptId, data.eventType);

    if (data.eventType === 'UNFOCUS') {
      await this.monitoringService.markAsCheated(data.attemptId);
      this.server.to(`exam-admin-${data.examId}`).emit('student-cheating-alert', {
        attemptId: data.attemptId,
        userId: client.data.user.sub,
        eventType: data.eventType,
      });
    }

    // Notify all listeners
    const payload = {
      attemptId: data.attemptId,
      userId: client.data.user.sub,
      eventType: data.eventType,
    };
    
    this.server.to(`exam-admin-${data.examId}`).emit('student-updated', payload);
    this.server.to(`exam-${data.attemptId}`).emit('student-updated', payload);
  }
}
