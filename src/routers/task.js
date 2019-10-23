const { getRouter } = require("./crud");
const { Task } = require("../models");

module.exports = getRouter(
  Task,
  {
    create: true,
    readDetail: true,
    readAll: true,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["description", "completed"]
  }
);
