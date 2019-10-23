const jwt = require("jsonwebtoken");
const { User } = require("../models");
const HttpStatus = require("http-status-codes");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    console.log(req.user);
    next();
  } catch (e) {
    res.status(HttpStatus.UNAUTHORIZED).send({ error: "Please authenticate." });
  }
};

module.exports = auth;
