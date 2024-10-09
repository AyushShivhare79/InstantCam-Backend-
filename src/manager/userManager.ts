import { WebSocket } from "ws";

export interface User {
  socket: WebSocket;
  name: string;
}
