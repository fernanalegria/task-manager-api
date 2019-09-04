const express = require("express");

require("./db");
const { userRouter, taskRouter } = require("./routers");

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
