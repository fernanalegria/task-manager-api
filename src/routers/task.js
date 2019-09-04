const { getRouter } = require("./crud");
const { Task } = require("../models");

module.exports = getRouter(
  Task,
  {
    create: true,
    read: true,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["description", "completed"]
  }
);
