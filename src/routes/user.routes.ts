import express from "express";

import {
  registerUser,
  showRegister,
  showLogin,
  loginUser,
  showHome,
  logoutUser,
} from "../controllers/user.controller";

import { isLoggedIn, isLoggedOut } from "../middlewares/authenticate";

const router = express.Router();

// router.get('/', findAllUsers)
router.get("/register", isLoggedOut, showRegister);
router.post("/register", registerUser);
router.get("/login", isLoggedOut, showLogin);
router.post("/login", loginUser);
router.get("/home", isLoggedIn, showHome);
router.get("/logout", isLoggedIn, logoutUser);

export default router;
