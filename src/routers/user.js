const { getRouter } = require("./crud");
const { User } = require("../models");
const HttpStatus = require("http-status-codes");

const userRouter = getRouter(
  User,
  {
    create: false,
    read: true,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["name", "email", "password", "age"]
  }
);

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

module.exports = userRouter;
