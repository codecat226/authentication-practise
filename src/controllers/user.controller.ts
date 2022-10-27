import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { decryptPassword, securePassword } from "../config/password";
import User from "../models/User";
import { sendVerifyEmail } from "../utils/verifyEmail";
import { v4 } from "uuid";
import { createToken } from "../utils/createToken";
import { sendPasswordEmail } from "../utils/sendPasswordEmail";

//GET method /register
export const showRegister: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("register");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//POST method /register
export const registerUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, name, email } = req.body;
    const hashedPW = await securePassword(password);
    const newUser = new User({
      name: name,
      user_id: v4(),
      email: email,
      password: hashedPW,
      isAdmin: 0,
      isVerified: 0,
    });
    const userData = await newUser.save();
    if (userData) {
      sendVerifyEmail(userData.email, userData._id, "Verify email");
      res.status(201).render("register", {
        message: "registration successful, please verify your email address.",
      });
    } else {
      res.status(404).render("register", {
        message: "registration unsuccessful, please try again.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /login
export const showLogin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("login");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /login
export const loginUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user input from body
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email: email });
    if (foundUser) {
      //check password
      const isMatch = await decryptPassword(password, foundUser.password);
      if (isMatch) {
        if (foundUser.isVerified) {
          //if password is correct, create session, render the home page
          req.session.user = foundUser._id;
          res.redirect("/users/home");
        } else {
          res
            .status(200)
            .render("login", { message: "please verify email first" });
        }
      } else {
        res
          .status(404)
          .render("login", { message: "email & password did not match" });
      }
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /home
export const showHome: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get particular user data from SESSION id
    const userData = await User.findOne({ _id: req.session.user });
    res.status(200).render("home", { user: userData });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//GET method /logout
export const logoutUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).redirect("/users/login");
      }
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /verify
export const verifyUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.query.id;

    const userUpdated = await User.updateOne(
      { _id: id },
      {
        $set: {
          isVerified: 1,
        },
      }
    );
    if (userUpdated) {
      res.render("verify", { message: "verification successful" });
    } else {
      res.render("verify", { message: "verification unsuccessful" });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /resend-verify
export const showResendVerify: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("resendVerify");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /resend-verify
export const resendVerifyUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //try to find user with id passed in url query
    const { email } = req.body;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerified) {
        res.status(200).render("resendVerify", {
          message: "User already verified.",
        });
      } else {
        sendVerifyEmail(userData.email, userData._id, "Verify Email");
        res.status(200).render("resendVerify", {
          message: "Verification link sent to your email address.",
        });
      }
    } else {
      res.status(404).render("resendVerify", {
        message: "No user associated with this email address.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /forgot-password
export const showForgotPassword: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("forgotPassword");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /forgot-password
export const forgotPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.isVerified) {
        const newToken = createToken();
        const updatedToken = await User.updateOne(
          { email: email },
          {
            $set: {
              token: newToken,
            },
          }
        );
        sendPasswordEmail(
          userData.email,
          userData._id,
          "Reset Password",
          newToken,
          "users"
        );
        res
          .status(200)
          .render("forgotPassword", { message: "password reset email sent." });
      } else {
        res.render("forgotPassword", {
          message: "please verify your email first",
        });
      }
    } else {
      res.status(404).json({ message: "Failed to find user with email." });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /reset-password
export const showResetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    const userData = await User.findOne({ token: token });
    if (userData) {
      res.status(200).render("resetPassword", { user_id: userData._id });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /reset-password
export const resetPassword: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //try to find user with token and id passed in url query
    const { password, user_id } = req.body;

    const hashPW = await securePassword(password);
    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: hashPW,
          token: "",
        },
      }
    );
    res.status(200).redirect("/users/login");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /update-user
export const showUpdateUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById({ _id: req.session.user });
    res.status(200).render("updateUser", { user: user });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//POST method /update-user
export const updateUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session_id = req.session.user;
    const user = await User.findById({ _id: session_id });
    if (req.body.email !== user?.email) {
      const userUpdated = await User.findByIdAndUpdate(
        { _id: session_id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            isVerified: 0,
          },
        },
        //returns updated object to user variable
        { new: true }
      );
      if (userUpdated) {
        sendVerifyEmail(userUpdated.email, userUpdated._id, "Verify email");
        res.status(200).render("updateUser", {
          message: "please verify your new email address!",
          user: userUpdated,
        });
      } else {
        res.status(404).render("updateUser", {
          message: "Could not update user, please try again.",
          user: user,
        });
      }
    } else {
      //if user email is not updated:
      const userUpdated = await User.findByIdAndUpdate(
        { _id: session_id },
        {
          $set: {
            name: req.body.name,
          },
        },
        { new: true }
      );
      if (userUpdated) {
        res.status(200).render("updateUser", {
          message: "User successfully updated!",
          user: userUpdated,
        });
      } else {
        res.status(404).render("updateUser", {
          message: "Could not update user, please try again.",
          user: user,
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      message: "Server error",
    });
  }
};

// GET method /delete-user
export const showDeleteUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ _id: req.session.user });
    res.status(200).render("deleteUser");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /delete-user
export const deleteUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ _id: req.session.user });
    if (user) {
      await User.findOneAndDelete({ _id: req.session.user });
      res.status(200).render("deleteUser", { message: "user deleted" });
      res.redirect("/users/register");
    } else {
      res.status(404).render("deleteUser", { message: "could not find user" });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};
