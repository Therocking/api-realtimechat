import {createServer} from "node:http";
import express from "express";
import logger from "morgan";
import {Server} from "socket.io";
import {createClient} from "@libsql/client";


const port = process.env.PORT ?? 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
   connectionStateRecovery: {}
});

const db = createClient({
   url: process.env.DB_URL,
   authToken: process.env.DB_TOKEN
})

/*await db.execute(`
   DROP TABLE IF EXISTS users;
   DROP TABLE IF EXISTS chats;
   DROP TABLE IF EXISTS msgs;

CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
   );

   CREATE TABLE IF NOT EXISTS chats(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partitipant TEXT
   );

CREATE TABLE IF NOT EXISTS msgs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER,
      user_id INTEGER,
      content TEXT,
   foreign key(chat_id) references chats(id) 
   foreign key(user_id) references users(id)
   );
`)*/

app.use(logger("dev"))

app.get("/", (_req, res) => {
   res.sendFile(process.cwd() + "/client/index.html")
})

app.get("/private", (_req, res) => {
   res.sendFile(process.cwd() + "/client/private.html")
})

// Rooms
const sala = io.of("/private");
sala.on("connection", async(socket) => {
   socket.on("disconnect", () => {
      console.log("An user has disconnected to the room")
   })

   socket.on("join-room", async(data) => {
      const username = socket.handshake.auth.username;
      console.log( `${username} has joined to room: ${data.room}`)
      try{
	 await db.execute({
	    sql: `INSERT INTO chats (PARTITIPANT) VALUES (:user)`,
	    args: {user: username}
	 })
	 sala.emit("welcome-to-channel", `${username} has joined to the room`)
      }catch(err) {console.log(err)}
   })

   socket.on("chat-message", async(data) => {

   })

   /*socket.on("chat-message", async(data) => {
      let result;
      const username = socket.handshake.auth.username ?? "pedro"
      try{
	 result = await db.execute({
	    sql: `INSERT INTO messages (content, user) VALUES (:content, :username)`,
	    args: {content: data, username}
	 })
      }catch(err) {
	 console.log(err)
	 return
      }

     sala.emit("emit-message", data, result.lastInsertRowid.toString(), username)
   })

   if(!socket.recovered) {
      try {
	 const results = await db.execute({
	    sql: `SELECT id, content, user FROM messages WHERE id > ?`,
	    args: [socket.handshake.auth.serverOffset ?? 0]
	 });

	 results.rows.forEach(row => {
	    socket.emit("emit-message", row.content, row.id.toString(), row.user)
	 })
      }catch(err) {
	 console.log(err)
      }
   }*/

})

io.on("connection", async(socket) => {
   console.log("An user has connected")

   socket.on("disconnect", () => {
      console.log("An user has disconnected")
   })

/*io.of("/private").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});*/

   //socket.join("private-chat")
   //socket.except("private-chat").emit("hi", "hola")

   socket.on("chat-message", async(data) => {
      let result;
      const username = socket.handshake.auth.username ?? "pedro"
      try{
	 result = await db.execute({
	    sql: `INSERT INTO messages (content, user) VALUES (:content, :username)`,
	    args: {content: data, username}
	 })
      }catch(err) {
	 console.log(err)
	 return
      }

     io.emit("emit-message", data, result.lastInsertRowid.toString(), username)
   })

   if(!socket.recovered) {
      try {
	 const results = await db.execute({
	    sql: `SELECT id, content, user FROM messages WHERE id > ?`,
	    args: [socket.handshake.auth.serverOffset ?? 0]
	 });

	 results.rows.forEach(row => {
	    socket.emit("emit-message", row.content, row.id.toString(), row.user)
	 })
      }catch(err) {
	 console.log(err)
      }
   }

})
server.listen(port, () => {
   console.log("Server on port", port)
})
