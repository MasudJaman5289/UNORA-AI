import jwt from "jsonwebtoken";
import RoomMessage from "../models/RoomMessage.js";
import Room from "../models/Room.js";

export default function roomSocket(io) {

  /* ================= SOCKET AUTH ================= */

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.log("❌ No token received");
        return next(new Error("Socket auth error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();

    } catch (err) {
      console.log("❌ Socket auth failed:", err.message);
      next(new Error("Socket auth error"));
    }
  });

  /* ================= CONNECTION ================= */

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    /* ================= JOIN ROOM ================= */

    socket.on("joinRoom", async (room) => {
      try {
        socket.join(room);
        console.log(`👤 User joined room: ${room}`);

        // Send previous messages sorted by time
        const previousMessages = await RoomMessage
          .find({ room })
          .sort({ createdAt: 1 });

        socket.emit("previousMessages", previousMessages);

      } catch (err) {
        console.log("❌ Error loading previous messages:", err.message);
      }
    });

    /* ================= SEND MESSAGE ================= */

    socket.on("sendMessage", async ({ room, message, userName }) => {
      console.log("📨 Incoming message:", { room, message, userName });
      
      try {
        const newMessage = await RoomMessage.create({
          room,
          userId: socket.user.id,
          userName,
          message,
        });

        // Update last activity for room
        await Room.findOneAndUpdate(
          { name: room },
          { lastActivity: new Date() },
          { upsert: true }
        );

        io.to(room).emit("receiveMessage", newMessage);

      } catch (err) {
        console.log("❌ Message save error:", err.message);
      }
    });

    /* ================= DELETE MESSAGE ================= */

    socket.on("deleteMessage", async (data) => {
      try {
        // ✅ FIX: Handle both field names (id from frontend, messageId fallback)
        const messageId = data.id || data.messageId;
        const { room } = data;

        console.log("🗑️ Delete request:", { messageId, room });

        if (!messageId) {
          console.log("❌ No messageId provided");
          return socket.emit("error", { message: "No message ID provided" });
        }

        // ✅ FIX: Use RoomMessage (not Message)
        const deleted = await RoomMessage.findByIdAndDelete(messageId);
        
        if (deleted) {
          console.log("✅ Message deleted:", messageId);
          io.to(room).emit("messageDeleted", messageId);
        } else {
          console.log("❌ Message not found:", messageId);
          socket.emit("error", { message: "Message not found" });
        }

      } catch (err) {
        console.error("❌ Delete error:", err.message);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    /* ================= DISCONNECT ================= */

    socket.on("disconnect", () => {
      console.log("🔌 User disconnected:", socket.id);
    });
  });
}