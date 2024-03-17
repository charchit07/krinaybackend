// index.js
const express = require("express");
const todoRouter = require("./Router/Todo.Router");
const userRouter = require("./Router/User.Router");
const { authenticate } = require("./Middleware/Aunthication.Middleware");
const cors = require("cors");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Home page");
});

app.use(cors());

app.use("/users", userRouter);

app.use(authenticate);
app.use("/", todoRouter);

app.listen(7500, () => {
  console.log("Server is running on port 7500");
});
