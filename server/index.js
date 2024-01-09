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

// Este código no lo hize para ejecutar, toma cada consulta SQL y ejecutala en el CLI de turso
// y ya podrías utilizar el código correctamente, más o menos.
/*await db.execute(`
   DROP TABLE IF EXISTS users;
   DROP TABLE IF EXISTS chats;
   DROP TABLE IF EXISTS msgs;

CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
   );

   CREATE TABLE IF NOT EXISTS chats(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      user_id,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

// Registra los rutas solicitadas
//app.use(logger("dev"))

app.get("/", (_req, res) => {
   res.sendFile(process.cwd() + "/client/index.html")
})

app.get("/private", (_req, res) => {
   res.sendFile(process.cwd() + "/client/private.html")
})

// Chat apartado del público(no le llegan los eventos a todos los usuarios, sólo a los que están en
   // esta sala).
const sala = io.of("/private");
sala.on("connection", async(socket) => {
   socket.on("disconnect", () => {
      console.log("An user has disconnected to the room")
   })

   // Evento que ocurre al unirse a la sala
   socket.on("join-room", async(data) => {
      const {username, userId} = socket.handshake.auth;
      console.log( `${username} id: ${userId} has joined to room: ${data.room}`)
      try{
	 // Verifica que el usuario exista en la tabla chats
	 const userExits = await db.execute({
	    sql: `SELECT user_id FROM chats WHERE id = ?`,
	    args: [userId]
	 })
	 
	 // Si no existe en la tabla lo inserta
	 if(!userExits) {
	    await db.execute({
	       sql: `INSERT INTO chats (user_id) VALUES (:userId) where id = :chat_id`,
	       args: {userId, chatId: 1}
	    })
	 }

	 // De lo contrario, sigue el flujo normal de ejecución
	 sala.emit("welcome-to-channel", `${username} has joined to the room ${sala}`)
      }catch(err) {console.log(err)}
   })

   // Todavía no hay una implementación para utilizar automaticamente los ids de los usuarios ni de los chats,
   // para este ejemplo cambia manualmente esos ids. 
   socket.on("chat-message", async(data) => {
      const {username, userId} = socket.handshake.auth;
      try{
	 // Escucha el emit del cliente y toma el dato que emite y lo inserta
	 // en la tabla de mensajes.
	 const result = await db.execute({
	    sql: `INSERT INTO msgs(chat_id, user_id, content) VALUES(:chatId, :userId, :data)`,
	    args: {chatId: 1, userId, data}
	 })

	 sala.emit("emit-message", data, result.lastInsertRowid.toString(), username)
      }catch(err) {
	 console.log(err)
      }
   })

   // Genera los últimos mensajes de la sala
   if(!socket.recovered) {
     try {
      const {username} = socket.handshake.auth;
	const results = await db.execute({
	   sql: `SELECT id, content, user_id, chat_id FROM msgs WHERE id > ? AND chat_id = 1`,
	args: [socket.handshake.auth.serverOffset ?? 0]
	});
	
	results.rows.forEach(row => {
	socket.emit("emit-message", row.content, row.id.toString(), row.user_id)
	})
	}catch(err) {
	console.log(err)
     }
  }

   // Ejemplos anteriores
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

/*Falta implementación*/
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
      const {username} = socket.handshake.auth
      try{
	 result = await db.execute({
	    sql: `INSERT INTO msgs (chat_id, user_id, content) VALUES (:chatId, :userId, :data)`,
	    args: {chatId: 2, userId: 2, data}
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
	    sql: `SELECT id, content, user_id, chat_id FROM msgs WHERE id > ? AND chat_id = 2`,
	    args: [socket.handshake.auth.serverOffset ?? 0]
	 });

	 results.rows.forEach(row => {
	    socket.emit("emit-message", row.content, row.id.toString(), row.user_id)
	 })
      }catch(err) {
	 console.log(err)
      }
   }

})
server.listen(port, () => {
   console.log("Server on port", port)
})
