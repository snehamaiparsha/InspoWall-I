import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    pin: { type: Schema.Types.ObjectId, ref: "Pin", required: true },
    description: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", commentSchema);
