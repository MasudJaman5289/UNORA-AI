import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import roomSocket from "./sockets/roomSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://unora-ai.vercel.app"  // ← Removed space
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

roomSocket(io);

/* ================= MIDDLEWARE ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://unora-ai.vercel.app" 
    ], 
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/rooms", roomRoutes);

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/unora")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err));

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("UNORA AI Backend Running 🚀");
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});