const HttpStatus = require("http-status-codes");
const express = require("express");

const { updateRouter } = require("./crud");
const { User } = require("../models");
const { auth } = require("../middleware");

let userRouter = new express.Router();

userRouter.post("", async (req, res) => {
  const userInstance = new User(req.body);
  try {
    const user = await userInstance.save();
    const token = await user.generateAuthToken();
    res.status(HttpStatus.CREATED).send({ user, token });
  } catch (e) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: e.message });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("You must provide email and password");
    }
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.status(HttpStatus.OK).send({ user, token });
  } catch (e) {
    res.status(HttpStatus.BAD_REQUEST).send({ error: e.message });
  }
});

userRouter.get("/me", auth, async (req, res) => {
  res.status(HttpStatus.OK).send(req.user);
});

userRouter = updateRouter(
  userRouter,
  User,
  {
    create: false,
    readDetail: true,
    readAll: false,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["name", "email", "password", "age"]
  }
);

module.exports = userRouter;
