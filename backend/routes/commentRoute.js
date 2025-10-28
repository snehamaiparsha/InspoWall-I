import express from "express";
import {
  getPostComments,
  addComment,
} from "../controllers/commentController.js";
import { verifyToken } from "../middlewares/verifyToken.js";
const router = express.Router();

router.get("/:postId", getPostComments);
router.post("/", verifyToken, addComment);

export default router;
