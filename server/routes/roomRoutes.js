import express from "express";
import { 
  getRoomMessages, 
  getRecentRoomActivity 
} from "../controllers/roomController.js";

const router = express.Router();

// IMPORTANT: activity route must come BEFORE :room
router.get("/activity", getRecentRoomActivity);

router.get("/:room", getRoomMessages);

export default router;