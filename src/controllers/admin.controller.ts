import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { v4 } from "uuid";
import { decryptPassword, securePassword } from "../config/password";
import User from "../models/User";
import { createToken } from "../utils/createToken";
import { sendPasswordEmail } from "../utils/sendPasswordEmail";
import { sendVerifyEmail } from "../utils/verifyEmail";

// GET method /login
export const showAdminLogin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("adminLogin");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// POST method /login
export const loginAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const foundAdmin = await User.findOne({ email: email });
    if (foundAdmin) {
      //check password
      const isMatch = await decryptPassword(password, foundAdmin.password);
      if (isMatch) {
        if (foundAdmin.isAdmin) {
          //if password is correct, create session, render the home page
          req.session.user = foundAdmin._id;
          res.status(200).redirect("/admin/home");
        } else {
          res.render("adminLogin", { message: "only admin can log in" });
        }
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

// GET method /home
export const showAdminHome: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get particular user data from SESSION id
    const adminData = await User.findOne({ _id: req.session.user });
    res.status(200).render("adminHome", { user: adminData });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//GET method /logout
export const logoutAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).redirect("/admin/login");
      }
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

// GET method /dashboard
export const showDashboard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //search feature
    const search = req.query.search ? req.query.search : "";

    //get all users info who are NOT admin
    //get pagination info from query url
    const { page = 1, limit = 3 } = req.query;
    const userCount = await User.find({
      isAdmin: 0,
      //$or operator performs on name and email, returns documents satisfying either
      // $regex checks anything can be before or after, and option for case insensitivity
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();
    const users = await User.find({
      isAdmin: 0,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).render("adminDashboard", {
      users: users,
      totalP: Math.ceil(userCount / Number(limit)),
      currentP: Number(page),
      nextP: Number(page) + 1,
      prevP: Number(page) - 1,
    });
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
    const { id } = req.query;
    const user = await User.findOne({ _id: id });
    if (user) {
      await User.findOneAndDelete({ _id: id });
      res.status(200).redirect("/admin/dashboard");
    } else {
      res.status(404).send("could not find user");
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
    res.status(200).render("adminForgotPassword");
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

    const adminData = await User.findOne({ email: email });
    if (adminData) {
      if (adminData.isAdmin) {
        const newToken = createToken();
        await User.updateOne(
          { email: email },
          {
            $set: {
              token: newToken,
            },
          }
        );
        sendPasswordEmail(
          adminData.email,
          adminData._id,
          "Reset Password",
          newToken,
          "admin"
        );
        res.status(200).render("adminForgotPassword", {
          message: "password reset email sent.",
        });
      } else {
        res.render("adminForgotPassword", {
          message: "Not admin. Please use user login",
        });
      }
    } else {
      res.status(404).json({ message: "Failed to find admin with email." });
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
    const adminData = await User.findOne({ token: token });
    if (adminData) {
      res.status(200).render("adminResetPassword", { admin_id: adminData._id });
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
    //get new password and id (hidden) from body
    const { password, admin_id } = req.body;
    //hash password
    const hashPW = await securePassword(password);
    await User.findByIdAndUpdate(
      { _id: admin_id },
      {
        $set: {
          password: hashPW,
          token: "",
        },
      }
    );
    res.status(200).redirect("/admin/login");
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
    const user = await User.findOne({ _id: req.query.id });
    if (user) {
      res.status(200).render("adminUpdateUser", { user: user });
    } else {
      res.status(404).send("could not find user");
    }
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
  const { id } = req.query;
  try {
    const { name, email, verify } = req.body;
    const foundUser = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: name,
          email: email,
          isVerified: verify,
        },
      },
      { new: true }
    );
    if (foundUser) {
      res.status(200).render("adminUpdateUser", {
        message: "User successfully updated.",
        user: foundUser,
      });
    } else {
      res.status(404).render("adminUpdateUser", {
        message: "Could not update user, please try again.",
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//GET method /add-user
export const showAddUser: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.status(200).render("adminAddUser");
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};

//POST method /add-user
export const addUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, name, email, admin, verify } = req.body;
    const hashedPW = await securePassword(password);
    const newUser = new User({
      name: name,
      user_id: v4(),
      email: email,
      password: hashedPW,
      isAdmin: admin,
      isVerified: verify,
    });
    const userData = await newUser.save();
    // console.log(userData);
    if (userData) {
      //if user is not verified AND is not admin --> send verify email
      if (userData.isVerified !== 1 && userData.isAdmin !== 1) {
        sendVerifyEmail(userData.email, userData._id, "Verify email");
        res.status(201).render("adminAddUser", {
          message:
            "Successfully added user. User needs to verify email address",
        });
      } else {
        res.status(201).render("adminAddUser", {
          message: "Successfully added user.",
        });
      }
    } else {
      res.status(404).render("adminAddUser", {
        message: "Could not add user, please try again.",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
};
