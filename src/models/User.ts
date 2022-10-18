import mongoose, { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  isAdmin: number;
  isVerified: number;
}

const userSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter an email address"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: [8, "Password must be at least 8 characters"],
    required: [true, "User must provide a password"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must be at least eight characters, with at least one uppercase letter, one lowercase letter, one number and one special character",
    ],
  },
  isAdmin: {
    type: Number,
    required: [true, "isAdmin is required"], //0 = is not admin
  },
  isVerified: {
    type: Number,
    default: 0, //0 = user is not verified
  },
});

export const User = model<UserDocument>("User", userSchema);
