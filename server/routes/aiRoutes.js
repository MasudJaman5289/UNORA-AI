import express from "express";
import { generateAnswer, getUserQuestions } from "../controllers/aiController.js";
import { validateRoomQuestion } from "../controllers/aiController.js";

const router = express.Router();

router.post("/ask", generateAnswer);
router.get("/history", getUserQuestions);
router.post("/validate-room", validateRoomQuestion);

export default router;