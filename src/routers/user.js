const HttpStatus = require("http-status-codes");
const express = require("express");

const { getErrorResponse } = require("./crud");
const { User } = require("../models");
const { auth } = require("../middleware");

const userRouter = new express.Router();

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

userRouter.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(HttpStatus.NO_CONTENT).send();
  } catch (e) {
    const { error, statusCode } = getErrorResponse(e);
    res.status(statusCode).send({ error });
  }
});

userRouter.patch("/me", auth, async (req, res) => {
  const allowedUpdates = ["name", "email", "password", "age"];
  const updateFields = Object.keys(req.body);
  const invalidUpdates = updateFields.filter(
    update => !allowedUpdates.includes(update)
  );
  if (invalidUpdates.length > 0) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ error: `Invalid updates: ${invalidUpdates}` });
  }

  try {
    updateFields.forEach(field => {
      req.user[field] = req.body[field];
    });
    user = await req.user.save();
    res.status(HttpStatus.OK).send(user);
  } catch (e) {
    const { error, statusCode } = getErrorResponse(e);
    res.status(statusCode).send({ error });
  }
});

module.exports = userRouter;
