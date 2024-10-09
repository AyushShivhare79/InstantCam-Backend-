// import { User } from "./userManager";

// interface Room {
//   user1: User;
//   user2: User;
// }

// let GLOBAL_ROOM_ID = 1;

// let users: User[];
// let rooms: Map<string, Room>;

// export const createRoom = ({ user1, user2 }: Room) => {
//   const roomId = GLOBAL_ROOM_ID++;
//   rooms.set(roomId.toString(), { user1, user2 });
//   user1.socket.emit("send-offer", {
//     roomId,
//   });

//   user2.socket.emit("send-offer", {
//     roomId,
//   });
// };

// export const onOffer = (
//   roomId: string,
//   sdp: string,
//   senderSocketid: string
// ) => {
//   const room = rooms.get(roomId);
//   if (!room) {
//     return;
//   }
//   const receivingUser =
//     room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
//   receivingUser?.socket.emit("offer", {
//     sdp,
//     roomId,
//   });
// };
