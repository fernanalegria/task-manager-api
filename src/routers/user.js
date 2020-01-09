const HttpStatus = require("http-status-codes");
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const { getErrorResponse } = require("./crud");
const { User } = require("../models");
const { auth } = require("../middleware");
const { sendWelcomeEmail, sendGoodByeMail } = require("../emails");

const logoutMsg = "Unable to log out user";
const allowedImgTypes = ["image/jpeg", "image/png"];
const allowedFileExtensions = /\.(jpg|jpeg|png)$/;
const imgSize = { width: 250, height: 250 };

const userRouter = new express.Router();
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(_req, file, cb) {
    if (
      !file.originalname.match(allowedFileExtensions) ||
      !allowedImgTypes.includes(file.mimetype)
    ) {
      return cb(
        new Error(
          "Please upload an image. Only the following formats are allowed: jpg, jpeg and png."
        )
      );
    }
    cb(undefined, true);
  }
});

userRouter.post("", async (req, res) => {
  const userInstance = new User(req.body);
  try {
    const user = await userInstance.save();
    sendWelcomeEmail(user.email, user.name);
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

userRouter.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const user = req.user;
    user.avatar = await sharp(req.file.buffer)
      .resize(imgSize)
      .png()
      .toBuffer();
    await user.save();
    res.status(HttpStatus.OK).send();
  },
  (error, req, res, next) => {
    res.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
  }
);

userRouter.delete("/me/avatar", auth, async (req, res) => {
  const user = req.user;
  user.avatar = undefined;
  await user.save();
  res.status(HttpStatus.OK).send();
});

userRouter.get("/:id/avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.status(HttpStatus.OK).send(user.avatar);
  } catch (e) {
    res.status(HttpStatus.NOT_FOUND).send();
  }
});

userRouter.get("/me", auth, async (req, res) => {
  res.status(HttpStatus.OK).send(req.user);
});

userRouter.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    const user = req.user;
    sendGoodByeMail(user.email, user.name);
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
