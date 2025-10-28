import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDb is connected");
  } catch (err) {
    console.log("mongoose error", err);
  }
};
export default connectDB;
