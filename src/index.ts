import { WebSocket, WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 8080 });

// let senderSocket: WebSocket | null = null;
// let receiverSocket: WebSocket | null = null;

let waitingUser: WebSocket | null = null;

wss.on("connection", function connection(ws: WebSocket) {
  if (waitingUser) {
    const otherUser = waitingUser;
    waitingUser = null;

    ws.send(
      JSON.stringify({ type: "match", message: "Paired with a random user." })
    );
    otherUser.send(
      JSON.stringify({ type: "match", message: "Paired with a random user." })
    );

    // Relay WebRTC offer/answer and ICE candidates between users
    ws.on("message", (message: any) => {
      const data = JSON.parse(message);
      if (
        data.type === "createOffer" ||
        data.type === "createAnswer" ||
        data.type === "iceCandidate"
      ) {
        otherUser.send(message); // Send WebRTC messages to the other peer
      }
    });

    otherUser.on("message", (message: any) => {
      const data = JSON.parse(message);
      if (
        data.type === "createOffer" ||
        data.type === "createAnswer" ||
        data.type === "iceCandidate"
      ) {
        ws.send(message); // Send WebRTC messages to the first peer
      }
    });

    // Handle user disconnection
    ws.on("close", () => {
      otherUser.send(
        JSON.stringify({ type: "info", message: "Other user disconnected." })
      );
    });

    otherUser.on("close", () => {
      ws.send(
        JSON.stringify({ type: "info", message: "Other user disconnected." })
      );
    });
  } else {
    waitingUser = ws;
    ws.send(
      JSON.stringify({
        type: "info",
        message: "Waiting for a random user to join...",
      })
    );
    ws.on("close", () => {
      if (waitingUser === ws) {
        waitingUser = null;
      }
    });
  }
});

// ws.on("error", console.error);
// ws.on("message", function message(data: any) {
//   const message = JSON.parse(data);
//   console.log("Message: ", JSON.parse(data));
//   if (message.type === "sender") {
//     senderSocket = ws;
//   } else if (message.type === "receiver") {
//     receiverSocket = ws;
//   } else if (message.type === "createOffer") {
//     if (ws !== senderSocket) {
//       return;
//     }
//     receiverSocket?.send(
//       JSON.stringify({ type: "createOffer", sdp: message.sdp })
//     );
//   } else if (message.type === "createAnswer") {
//     if (ws !== receiverSocket) {
//       return;
//     }
//     senderSocket?.send(
//       JSON.stringify({ type: "createAnswer", sdp: message.sdp })
//     );
//   } else if (message.type === "iceCandidate") {
//     if (ws === senderSocket) {
//       receiverSocket?.send(
//         JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//       );
//     } else if (ws === receiverSocket) {
//       senderSocket?.send(
//         JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//       );
//     }
//   }
// });
// });
