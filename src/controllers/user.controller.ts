import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { decryptPassword, securePassword } from "../config/password";
import { User } from "../models/User";

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

export const registerUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    const hashedPW = await securePassword(password);
    const newUser = new User({
      email: email,
      password: hashedPW,
      isAdmin: 0,
      isVerified: 0,
    });
    // console.log(newUser);
    // console.log(mongoose.connection.readyState);
    const userData = await newUser.save();
    if (userData) {
      res.redirect("/login");
    } else {
      res.status(404).send("route not found");
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

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
        //if password is correct, create session, render the home page
        req.session.user = foundUser._id;
        res.redirect("/home");
      } else {
        res.status(404).send({ message: "email & password did not match" });
      }
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

export const showHome: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("home");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

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
        res.status(200).redirect("/login");
      }
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};
