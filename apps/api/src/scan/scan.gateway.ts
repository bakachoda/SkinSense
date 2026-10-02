import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ScanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ScanGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { scanId: string },
  ) {
    if (payload?.scanId) {
      const room = `scan:${payload.scanId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room ${room}`);
      return { event: "subscribed", data: { scanId: payload.scanId } };
    }
    return { event: "error", data: "scanId required" };
  }

  emitProgress(
    scanId: string,
    stage: "preprocessing" | "segmentation" | "detection" | "scoring" | "routine" | string,
    progress: number,
    data?: any,
  ) {
    const room = `scan:${scanId}`;
    this.logger.log(`Emitting scan:progress to room ${room} [stage=${stage}, progress=${progress}]`);
    this.server.to(room).emit("scan:progress", {
      scanId,
      stage,
      progress,
      data,
    });
  }

  emitComplete(scanId: string, result: any, routine?: any) {
    const room = `scan:${scanId}`;
    this.logger.log(`Emitting scan:complete to room ${room}`);
    this.server.to(room).emit("scan:complete", {
      scanId,
      result,
      routine,
    });
  }

  emitError(scanId: string, error: string, retryable = true) {
    const room = `scan:${scanId}`;
    this.logger.warn(`Emitting scan:error to room ${room}: ${error}`);
    this.server.to(room).emit("scan:error", {
      scanId,
      error,
      retryable,
    });
  }
}
