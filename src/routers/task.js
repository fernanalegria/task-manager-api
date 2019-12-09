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
// GET /tasks?sortBy=createdAt_asc
taskRouter.get("", auth, async (req, res) => {
  const match = {};
  const sort = {};
  const { completed, limit, skip, sortBy } = req.query;
  if (completed) {
    match.completed = completed === "true";
  }
  if (sortBy) {
    const [sortField, sortDirection] = sortBy.split('_');
    sort[sortField] = sortDirection === 'desc' ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          sort
        }
      })
      .execPopulate();
    res.status(HttpStatus.OK).send(req.user.tasks);
  } catch (e) {
    res.status(HttpStatus.SERVICE_UNAVAILABLE).send();
  }
});

module.exports = taskRouter;
