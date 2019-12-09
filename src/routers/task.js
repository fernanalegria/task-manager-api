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

// GET /tasks?completed=true/false
// GET /tasks?limit=10&skip=20
taskRouter.get("", auth, async (req, res) => {
  const match = {};
  const { completed, limit, skip } = req.query;
  if (completed) {
    match.completed = completed === "true";
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(limit),
          skip: parseInt(skip)
        }
      })
      .execPopulate();
    res.status(HttpStatus.OK).send(req.user.tasks);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
});

module.exports = taskRouter;
