import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  user_id: string;
  email: string;
  password: string;
  isAdmin: number;
  isVerified: number;
  token: string;
}

const userSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "must provide name"],
  },
  user_id: {
    type: String,
  },
  email: {
    type: String,
    trim: true,
    required: [true, "email can not be empty"],
    unique: true,
    // minlength: 3,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please enter a valid email address",
    // ],
  },
  password: {
    type: String,
    required: true,
    trim: true,
    // match: [
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   "Password must be at least eight characters, with at least one uppercase letter, one lowercase letter, one number and one special character",
    // ],
  },
  isAdmin: {
    type: Number,
    required: [true, "isAdmin is required"], //0 = is not admin
  },
  isVerified: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
    default: "",
  },
});

export default mongoose.model<UserDocument>("User", userSchema);
