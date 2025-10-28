import Pin from "../models/pinModel.js";
import User from "../models/userModel.js";
import Like from "../models/likeModel.js";
import Save from "../models/saveModel.js";
import Board from "../models/boardModel.js";
import sharp from "sharp";
import Imagekit from "imagekit";
import jwt from "jsonwebtoken";

// ---------------- GET ALL PINS ----------------
export const getPins = async (req, res) => {
  try {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const LIMIT = 21;

    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { tags: { $in: [search] } },
          ],
        }
      : userId
      ? { user: userId }
      : boardId
      ? { board: boardId }
      : {};

    const pins = await Pin.find(filter)
      .limit(LIMIT)
      .skip(pageNumber * LIMIT)
      .populate("user", "displayName username img");

    const hasNextPage = pins.length === LIMIT;

    res.status(200).json({
      pins,
      nextCursor: hasNextPage ? pageNumber + 1 : null,
    });
  } catch (error) {
    console.error("Error fetching pins:", error);
    res.status(500).json({ message: "Server error fetching pins" });
  }
};

// ---------------- GET SINGLE PIN ----------------
export const getPin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await Pin.findById(id).populate(
      "user",
      "username img displayName"
    );

    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }

    res.status(200).json(pin);
  } catch (error) {
    console.error("Error fetching pin:", error);
    res.status(500).json({ message: "Error fetching pin" });
  }
};

// ---------------- CREATE PIN ----------------
export const createPin = async (req, res) => {
  try {
    const {
      title,
      description,
      link,
      board,
      tags,
      textOptions,
      canvasOptions,
      newBoard,
    } = req.body;

    const media = req.files?.media;
    if (!title || !description || !media) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const parsedTextOptions = JSON.parse(textOptions || "{}");
    const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

    const metadata = await sharp(media.data).metadata();
    const originalOrientation =
      metadata.width < metadata.height ? "portrait" : "landscape";
    const originalAspectRatio = metadata.width / metadata.height;

    // 🛡️ Default Safe Values
    const safeCanvas = parsedCanvasOptions || {};
    const safeText = parsedTextOptions || {};
    const safeSize = safeCanvas.size || "original";
    const safeOrientation = safeCanvas.orientation || originalOrientation;
    const safeBg = (safeCanvas.backgroundColor || "#ffffff").replace("#", "");

    // Determine Aspect Ratio Safely
    let clientAspectRatio;
    if (safeSize !== "original") {
      const parts = safeSize.split(":");
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      clientAspectRatio = num && den ? num / den : originalAspectRatio;
    } else {
      clientAspectRatio =
        safeOrientation === originalOrientation
          ? originalAspectRatio
          : 1 / originalAspectRatio;
    }

    const width = metadata.width || 500;
    const height =
      Number.isFinite(width / clientAspectRatio) &&
      width / clientAspectRatio > 0
        ? width / clientAspectRatio
        : metadata.height || 500;

    // Compute overlay text position safely
    const textLeftPosition = Math.round(
      Number.isFinite(safeText.left) ? (safeText.left * width) / 375 : 0
    );
    const textTopPosition = Math.round(
      Number.isFinite(safeText.top) && Number.isFinite(safeCanvas.height)
        ? (safeText.top * height) / safeCanvas.height
        : 0
    );

    // Cropping strategy
    let croppingStrategy = "";
    if (safeSize !== "original") {
      if (originalAspectRatio > clientAspectRatio) {
        croppingStrategy = ",cm-pad_resize";
      }
    } else if (
      originalOrientation === "landscape" &&
      safeOrientation === "portrait"
    ) {
      croppingStrategy = ",cm-pad_resize";
    }

    // Safe Transformation String
    const transformationString = `w-${Math.round(width)},h-${Math.round(
      height
    )}${croppingStrategy},bg-${safeBg}${
      safeText.text
        ? `,l-text,i-${safeText.text},fs-${
            Number.isFinite(safeText.fontSize) ? safeText.fontSize * 2.1 : 60
          },lx-${textLeftPosition},ly-${textTopPosition},co-${(
            safeText.color || "#000000"
          ).replace("#", "")},l-end`
        : ""
    }`;

    // 🔐 Initialize ImageKit
    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    // 🧠 Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: media.data,
      fileName: media.name,
      folder: "test",
      transformation: { pre: transformationString },
    });

    // 🆕 Create new board if needed
    let finalBoardId = board || null;
    if (newBoard) {
      const newBoardDoc = await Board.create({
        title: newBoard,
        user: req.userId,
      });
      finalBoardId = newBoardDoc._id;
    }

    // 💾 Create new pin entry
    const newPin = await Pin.create({
      user: req.userId,
      title,
      description,
      link: link || null,
      board: finalBoardId,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      media: uploadResponse.filePath,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });

    res.status(201).json(newPin);
  } catch (err) {
    console.error("❌ Error in createPin:", err);
    return res.status(500).json({
      message: "Error creating pin",
      details: err?.message || "Unknown error",
    });
  }
};

// ---------------- CHECK INTERACTION ----------------
export const interactionCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;
    const likeCount = await Like.countDocuments({ pin: id });

    if (!token) {
      return res
        .status(200)
        .json({ likeCount, isLiked: false, isSaved: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (err || !payload?.userId) {
        return res
          .status(200)
          .json({ likeCount, isLiked: false, isSaved: false });
      }

      const userId = payload.userId;
      const isLiked = !!(await Like.findOne({ user: userId, pin: id }));
      const isSaved = !!(await Save.findOne({ user: userId, pin: id }));

      res.status(200).json({ likeCount, isLiked, isSaved });
    });
  } catch (error) {
    console.error("Error checking interaction:", error);
    res.status(500).json({ message: "Error checking interaction" });
  }
};

// ---------------- LIKE OR SAVE INTERACTION ----------------
export const interact = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "Type is required" });

    if (type === "like") {
      const existingLike = await Like.findOne({ pin: id, user: req.userId });
      if (existingLike) {
        await Like.deleteOne({ pin: id, user: req.userId });
      } else {
        await Like.create({ pin: id, user: req.userId });
      }
    } else if (type === "save") {
      const existingSave = await Save.findOne({ pin: id, user: req.userId });
      if (existingSave) {
        await Save.deleteOne({ pin: id, user: req.userId });
      } else {
        await Save.create({ pin: id, user: req.userId });
      }
    } else {
      return res.status(400).json({ message: "Invalid interaction type" });
    }

    res.status(200).json({ message: "Successful" });
  } catch (error) {
    console.error("Error in interact:", error);
    res.status(500).json({ message: "Error processing interaction" });
  }
};
