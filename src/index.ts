import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

// Make type of string as well like iceCandidates etc so, no error will be there

interface userType {
  id: string;
  socket: WebSocket;
}

interface RoomType {
  user1: userType;
  user2: userType;
}

let room = new Map<string, RoomType>();

let users: userType[] = [];
let userId = 1;
let roomId = 0;
wss.on("connection", function connection(ws) {
  let userWithId: userType;

  function findRoomWithUserId(map: any, searchKey: any) {
    for (const [key, value] of map.entries()) {
      if (value.user1.id === searchKey || value.user2.id === searchKey)
        return key;
    }
    return undefined;
  }
  userWithId = { id: "user" + userId++, socket: ws };

  ws.on("close", function () {
    const removeRoomId = findRoomWithUserId(room, userWithId.id);
    const remove = room.get(removeRoomId);

    if (userWithId.id === remove?.user1.id) {
      remove.user2.socket.send(
        JSON.stringify({ message: "Other user disconnect" })
      );
    } else if (userWithId.id === remove?.user2.id) {
      remove.user1.socket.send(
        JSON.stringify({ message: "Other user disconnect" })
      );
    }

    console.log("BeforeRoomDelete : ", room);

    // Delete room to free memeory
    room.delete(removeRoomId);
    console.log("AfterRoomDelete: ", room);
  });

  if (users.length < 2) {
    users.push(userWithId);

    console.log(users);
    if (users.length === 2) {
      roomId++;
      room.set(roomId.toString(), {
        user1: users[0],
        user2: users[1],
      });
      console.log("ROOM: ", room);
    } else if (users.length < 2) {
      ws.send(JSON.stringify({ message: "Waiting for someone to connect!" }));
      return;
    }
  }

  // Sending message of pair successful both side

  const pair = room.get(roomId.toString());
  pair?.user1.socket.send(JSON.stringify({ message: "Paired successful!" }));
  pair?.user2.socket.send(JSON.stringify({ message: "Paired successful!" }));

  // Giving both thier identity

  pair?.user1.socket.send(JSON.stringify({ user: "user1" }));
  pair?.user2.socket.send(JSON.stringify({ user: "user2" }));

  //Sharing data with each other
  pair?.user1.socket.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "createOffer") {
      pair?.user2.socket?.send(
        JSON.stringify({ type: "createOffer", sdp: message.sdp })
      );
    }
    if (message.type === "iceCandidate") {
      pair?.user2.socket?.send(
        JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
      );
    }
  });

  pair?.user2.socket.on("message", function message(data: any) {
    const message = JSON.parse(data);
    if (message.type === "createAnswer") {
      pair?.user1.socket?.send(
        JSON.stringify({ type: "createAnswer", sdp: message.sdp })
      );
    }
    if (message.type === "iceCandidate") {
      pair?.user1.socket?.send(
        JSON.stringify({ type: "iceCandidate", candidate: message.candidate })
      );
    }
  });

  users.pop();
  users.pop();
  console.log("Removed users: ", users);
});
