import express from "express";

import {
  registerUser,
  showRegister,
  showLogin,
  loginUser,
  showHome,
  logoutUser,
  verifyUser,
  showResendVerify,
  resendVerifyUser,
  showForgotPassword,
  forgotPassword,
  showResetPassword,
  resetPassword,
  showUpdateUser,
  updateUser,
  showDeleteUser,
  deleteUser,
} from "../controllers/user.controller";

import { isLoggedIn, isLoggedOut } from "../middlewares/authenticate";

const router = express.Router();

router.get("/register", isLoggedOut, showRegister);
router.post("/register", registerUser);
router.get("/login", isLoggedOut, showLogin);
router.post("/login", loginUser);
router.get("/home", isLoggedIn, showHome);
router.get("/logout", isLoggedIn, logoutUser);
router.get("/verify", isLoggedOut, verifyUser);
router.get("/resend-verify", isLoggedOut, showResendVerify);
router.post("/resend-verify", resendVerifyUser);
router.get("/forgot-password", isLoggedOut, showForgotPassword);
router.post("/forgot-password", isLoggedOut, forgotPassword);
router.get("/reset-password", isLoggedOut, showResetPassword);
router.post("/reset-password", isLoggedOut, resetPassword);
router.get("/update-user", isLoggedIn, showUpdateUser);
router.post("/update-user", isLoggedIn, updateUser);
router.get("/delete-user", isLoggedIn, showDeleteUser);
router.post("/delete-user", isLoggedIn, deleteUser);

export default router;

//CODE PLAN

//USER:
//register user
// 1. get user info from form
// 2. save user info to database
// 3. send verification email

//login user
// 1. get user info from form
// 2. check if user with info exists
// 3. create a session for user
// 4. redirect user to home page

//logout user
// 1. destroy session
// 2. redirect to login

//re/verify user
// 1. get email from form
// 2. check if email with account exists, user is already verified?
// 3. send verification email

// forgot password
// 1. get email from form
// 2. check if user with email exists, user is verified
// 3. create a token and set it in the database
// 4. send forget password email with token

// reset password
// 1. get token from url and find user with token
// 2. get form input new password and id from body (hidden ejs)
// 3. hash password, update password in database
// 4. reset token to empty string
// 5. redirect to login

// load user HOME page
// 1. get user info from session id
// 2. send user info to ejs to display

// update user
// 1. get user info and fill form with current user values
// 2. on post, check user with session id
// 3. if email is updated, send verify email after update, else just update

// delete user
// 1. on click of link -> get route
// 2. find user from session id
// 3. if user found, delete, redirect to login
