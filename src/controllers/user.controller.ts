import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

export const loadRegister: RequestHandler = (
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

export const registerUser: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
