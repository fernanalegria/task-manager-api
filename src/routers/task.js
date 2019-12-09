const HttpStatus = require("http-status-codes");
const { getRouter } = require("./crud");
const { Task } = require("../models");
const { auth } = require("../middleware");

const taskRouter = getRouter(
  Task,
  {
    create: true,
    readDetail: true,
    readAll: false,
    update: true,
    delete: true
  },
  {
    allowedUpdates: ["description", "completed"]
  }
);

taskRouter.get("", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match
      })
      .execPopulate();
    res.status(HttpStatus.OK).send(req.user.tasks);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
});

module.exports = taskRouter;
