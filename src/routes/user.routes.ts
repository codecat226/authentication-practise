import express from "express";

import {
  registerUser,
  loadRegister,
} from "../controllers/user.controller";

const router = express.Router();

// router.get('/', findAllUsers)
router.get("/register", loadRegister);
router.post("/register", registerUser);

export default router;
