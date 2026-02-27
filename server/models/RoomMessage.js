import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model("RoomMessage", roomMessageSchema);