import express from "express";
import { getUserBoards, getAllBoards } from "../controllers/boardController.js";
const router = express.Router();

// 👇 New route to fix 404
router.get("/", getAllBoards); // Handles GET /boards
router.get("/:userId", getUserBoards); // Handles GET /boards/:userId

export default router;
