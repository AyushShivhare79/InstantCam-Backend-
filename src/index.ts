import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface userType {
  id: string;
  socket: WebSocket;
}

interface RoomType {
  user1: userType;
  user2: userType;
}

let room: Map<string, RoomType>;

// let users: userType[]

let user: WebSocket | null;

wss.on("connection", function connection(ws) {
  // user.push({ socket: ws });
  // user.
  if (!user) {
    user = ws;
    user.send(JSON.stringify({ message: "Waiting for someone to connect!" }));
    return;
  }

  // users.push({})

  ws.send(JSON.stringify({ message: "Paired successful!" }));

  user.send(JSON.stringify({ user: "user1" }));
  ws.send(JSON.stringify({ user: "user2" }));

  user.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "createOffer") {
      ws?.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
    }
    if (message.type === "iceCandidate") {
      ws?.send(
        JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
      );
    }
  });

  ws.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "createAnswer") {
      user?.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
    }
    if (message.type === "iceCandidate") {
      user?.send(
        JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
      );
    }
  });

  // user.send(JSON.stringify({ type: 'createOffer' }));
  // user.send("Paired successful!");
});
