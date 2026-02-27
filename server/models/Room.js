import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  lastActivity: { type: Date, default: Date.now }
});

export default mongoose.model("Room", roomSchema);