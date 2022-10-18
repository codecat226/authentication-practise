import mongoose from "mongoose";
import { dev } from "./index";

export const connectDB = async () => {
  try {
    await mongoose.connect(dev.MONGO_URL);
    console.log("database is connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
