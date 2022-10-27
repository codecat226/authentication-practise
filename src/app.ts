import express from "express";
import { connectDB } from "./config/db";
import { dev } from "./config/index";
import userRouter from "./routes/user.routes";
import adminRouter from "./routes/admin.routes";
import session from "express-session";

const app = express();

declare module "express-session" {
  interface Session {
    user: string;
  }
}

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

const PORT = dev.PORT;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: dev.secret_key,
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/users", userRouter);
app.use("/admin", adminRouter);

app.listen(PORT, async () => {
  console.log(`server is running on http://localhost:${PORT}/users/login`);
  await connectDB();
});
