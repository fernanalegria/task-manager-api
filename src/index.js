const express = require("express");
const dotenv = require("dotenv");

require("./db");
const { userRouter, taskRouter } = require("./routers");

// Read environment variables
dotenv.config();

// Port for Express config
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use("/tasks", taskRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});
