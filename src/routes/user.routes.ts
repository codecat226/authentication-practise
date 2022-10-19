import express from "express";

import {
  registerUser,
  showRegister,
  showLogin,
  loginUser,
  showHome,
  logoutUser,
  showUsers,
  verifyUser,
} from "../controllers/user.controller";

import { isLoggedIn, isLoggedOut } from "../middlewares/authenticate";

const router = express.Router();

router.get("/users", showUsers);

//only show register if logged out
router.get("/register", isLoggedOut, showRegister);
router.post("/register", registerUser);
//only show login if logged out
router.get("/login", isLoggedOut, showLogin);
router.post("/login", loginUser);
//only show home if logged in
router.get("/home", isLoggedIn, showHome);
//only show logout if logged in
router.get("/logout", isLoggedIn, logoutUser);
router.get("/verify", isLoggedOut, verifyUser);

export default router;
