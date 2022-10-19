import * as dotenv from "dotenv";
dotenv.config();

export const dev = {
  MONGO_URL: process.env.MONGO_URL || "",
  PORT: process.env.PORT || 4004,
  secret_key: process.env.SECRET_KEY || "",
  auth_email: process.env.AUTH_EMAIL,
  auth_pw: process.env.AUTH_PW,
};
