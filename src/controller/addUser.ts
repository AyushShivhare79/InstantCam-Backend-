// interface UserType {
//     roomId: string;
//     id: string;
//     name: string;
// }

// export const addUser = () => {
//   const users: UserType[] = []; //It can be collection(noSQL) or table(SQL)

//   const addUser = ({ id, name, room }: UserType) => {
//     name = name.trim().toLowerCase();
//     room = room.trim().toLowerCase();

//     const existingUser = users.find(
//       (user) => user.room === room && user.name === name
//     );

//     if (!name || !room) return { error: "Username and room are required." };
//     if (existingUser) return { error: "Username is taken." };

//     const user = { id, name, room };

//     users.push(user);

//     return { user };
//   };
// };
