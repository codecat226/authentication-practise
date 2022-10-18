import express from "express";
import path from "path";
import { connectDB } from "./config/db";
import { dev } from "./config/index";
import userRouter from "./routes/user.routes";

const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
const PORT = dev.PORT;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", userRouter);
app.get("/test", (req, res) => {
  res.render("test");
});
app.listen(PORT, async () => {
  console.log(`server is running on http://localhost:${PORT}`);
  await connectDB();
});
