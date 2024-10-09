import { WebSocket, WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 8080 });

let senderSocket: WebSocket | null = null;
let receiverSocket: WebSocket | null = null;

let waitingUser: WebSocket | null = null;

wss.on("connection", function connection(ws: WebSocket) {
  console.log("Connected");
  if (waitingUser) {
    const otherUser = waitingUser;
    waitingUser = null;

    otherUser.send(
      JSON.stringify({ type: "sender", message: "Paired with a random user." })
    );
    ws.send(
      JSON.stringify({
        type: "receiver",
        message: "Paired with a random user.",
      })
    );

    ws.on("message", function message(data: any) {
      const message = JSON.parse(data);
      if (message.type === "sender") {
        senderSocket = ws;
      } else if (message.type === "receiver") {
        receiverSocket = ws;
      } else if (message.type === "createOffer") {
        if (ws !== senderSocket) {
          return;
        }
        receiverSocket?.send(
          JSON.stringify({ type: "createOffer", sdp: message.sdp })
        );
      } else if (message.type === "createAnswer") {
        if (ws !== receiverSocket) {
          return;
        }
        senderSocket?.send(
          JSON.stringify({ type: "createAnswer", sdp: message.sdp })
        );
      } else if (message.type === "iceCandidate") {
        if (ws === senderSocket) {
          receiverSocket?.send(
            JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
          );
        } else if (ws === receiverSocket) {
          senderSocket?.send(
            JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
          );
        }
      }
    });

    // Relay WebRTC offer/answer and ICE candidates between users
    // otherUser.on("message", (message: any) => {
    //   const data = JSON.parse(message);

    //   if (data.type === "createOffer") {
    //     ws.send(JSON.stringify({ type: "createOffer", sdp: data.sdp }));
    //   } else if (data.type === "iceCandidate") {
    //     ws.send(
    //       JSON.stringify({ type: "iceCandidate", candidate: data.candidate })
    //     );
    //   }
    // });

    // ws.on("message", (message: any) => {
    //   const data = JSON.parse(message);

    //   if (data.type === "createAnswer") {
    //     otherUser.send(JSON.stringify({ type: "createAnswer", sdp: data.sdp }));
    //   } else if (data.type === "iceCandidate") {
    //     otherUser.send(
    //       JSON.stringify({ type: "iceCandidate", candidate: data.candidate })
    //     );
    //   }
    // });

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

//   ws.on("error", console.error);
//   ws.on("message", function message(data: any) {
//     const message = JSON.parse(data);
//     if (message.type === "sender") {
//       senderSocket = ws;
//     } else if (message.type === "receiver") {
//       receiverSocket = ws;
//     } else if (message.type === "createOffer") {
//       if (ws !== senderSocket) {
//         return;
//       }
//       receiverSocket?.send(
//         JSON.stringify({ type: "createOffer", sdp: message.sdp })
//       );
//     } else if (message.type === "createAnswer") {
//       if (ws !== receiverSocket) {
//         return;
//       }
//       senderSocket?.send(
//         JSON.stringify({ type: "createAnswer", sdp: message.sdp })
//       );
//     } else if (message.type === "iceCandidate") {
//       if (ws === senderSocket) {
//         receiverSocket?.send(
//           JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//         );
//       } else if (ws === receiverSocket) {
//         senderSocket?.send(
//           JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//         );
//       }
//     }
//   });
// });

//   ws.on("error", console.error);
//   ws.on("message", function message(data: any) {
//     const message = JSON.parse(data);
//     console.log("Message: ", JSON.parse(data));
//     if (message.type === "sender") {
//       senderSocket = ws;
//     } else if (message.type === "receiver") {
//       receiverSocket = ws;
//     } else if (message.type === "createOffer") {
//       if (ws !== senderSocket) {
//         return;
//       }
//       receiverSocket?.send(
//         JSON.stringify({ type: "createOffer", sdp: message.sdp })
//       );
//     } else if (message.type === "createAnswer") {
//       if (ws !== receiverSocket) {
//         return;
//       }
//       senderSocket?.send(
//         JSON.stringify({ type: "createAnswer", sdp: message.sdp })
//       );
//     } else if (message.type === "iceCandidate") {
//       if (ws === senderSocket) {
//         receiverSocket?.send(
//           JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//         );
//       } else if (ws === receiverSocket) {
//         senderSocket?.send(
//           JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
//         );
//       }
//     }
//   });
// });
