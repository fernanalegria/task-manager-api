const HttpStatus = require("http-status-codes");
const express = require("express");

const { updateRouter } = require("./crud");
const { User } = require("../models");
const { auth } = require("../middleware");

let userRouter = new express.Router();

const logoutMsg = "Unable to log out user";

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

userRouter.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(doc => doc.token !== req.token);
    await req.user.save();

    res.status(HttpStatus.OK).send();
  } catch (e) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: logoutMsg });
  }
});

userRouter.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.status(HttpStatus.OK).send();
  } catch (e) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: logoutMsg });
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
