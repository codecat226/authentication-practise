import express, { Request, Response, NextFunction } from "express";

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.user) {
    } else {
      //if user is not login, direct to login page
      res.redirect("/admin/login");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export const isLoggedOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session.user) {
      //if user was logged in, redirect to home
      return res.redirect("/admin/home");
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
