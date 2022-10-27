import express from "express";
import {
  loginAdmin,
  showAdminLogin,
  showAdminHome,
  logoutAdmin,
  showDashboard,
  deleteUser,
  showForgotPassword,
  forgotPassword,
  showResetPassword,
  resetPassword,
  showUpdateUser,
  updateUser,
  showAddUser,
  addUser,
} from "../controllers/admin.controller";
import { isLoggedIn, isLoggedOut } from "../middlewares/authenticate-admin";
const router = express.Router();

//all routes have /admin
router.get("/login", isLoggedOut, showAdminLogin);
router.post("/login", loginAdmin);
router.get("/home", isLoggedIn, showAdminHome);
router.get("/logout", isLoggedIn, logoutAdmin);
router.get("/dashboard", isLoggedIn, showDashboard);
router.get("/delete-user", isLoggedIn, deleteUser);
router.get("/update-user", isLoggedIn, showUpdateUser);
router.post("/update-user", isLoggedIn, updateUser);
router.get("/forgot-password", isLoggedOut, showForgotPassword);
router.post("/forgot-password", isLoggedOut, forgotPassword);
router.get("/reset-password", isLoggedOut, showResetPassword);
router.post("/reset-password", isLoggedOut, resetPassword);
router.get("/add-user", isLoggedIn, showAddUser);
router.post("/add-user", isLoggedIn, addUser);


export default router;

//PLAN

// ADMIN:
// !!registering admin is done in users/register route.

//login 
// 1. get admin info from form
// 2. check if admin with info exists
// 3. create a session for admin
// 4. redirect admin to home page

//logout 
// 1. destroy session
// 2. redirect to login

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

// delete
// 1. create link for delete
// 2. get specific user id in url query
// 3. find user with matching id and delete from db

// update 
// 1. create link for update
// 2. get specific user id in url query
// 3. find user with same id
// 4. set new data to user in db, send verify email if necessary

// add user
// 1. create link for add user in dashboard
// 2. get add user page with form
// 3. check if verified is true, if not --> send verification email
// 4. post user data to mongodb

// Dashboard
// 1. show all users info
// 2. include pagination
// 3. include search feature