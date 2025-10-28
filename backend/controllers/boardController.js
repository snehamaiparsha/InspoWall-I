import Boards from "../models/boardModel.js";
import Pin from "../models/pinModel.js";

export const getAllBoards = async (req, res) => {
  try {
    const boards = await Boards.find();
    const boardsWithPinDetails = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board._id });
        const firstPin = await Pin.findOne({ board: board._id });
        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        };
      })
    );
    res.status(200).json(boardsWithPinDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching boards" });
  }
};

export const getUserBoards = async (req, res) => {
  const { userId } = req.params;
  try {
    const boards = await Boards.find({ user: userId });
    const boardsWithPinDetails = await Promise.all(
      boards.map(async (board) => {
        const pinCount = await Pin.countDocuments({ board: board._id });
        const firstPin = await Pin.findOne({ board: board._id });
        return {
          ...board.toObject(),
          pinCount,
          firstPin,
        };
      })
    );
    res.status(200).json(boardsWithPinDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user boards" });
  }
};
