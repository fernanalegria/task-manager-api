const { getRouter } = require("./crud");
const { User } = require("../models");

module.exports = getRouter(
  User,
  {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["name", "email", "password", "age"]
  }
);
