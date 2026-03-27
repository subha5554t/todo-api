const express = require("express");
const router = express.Router();
const { validateObjectId } = require("../middleware/validate");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  completeTask,
  deleteTask,
} = require("../controllers/taskController");

// POST   /api/tasks        - Create a task
// GET    /api/tasks        - Get all tasks
router.route("/").post(createTask).get(getAllTasks);

// GET    /api/tasks/:id    - Get single task
// PUT    /api/tasks/:id    - Edit task
// DELETE /api/tasks/:id    - Delete task
router
  .route("/:id")
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, updateTask)
  .delete(validateObjectId, deleteTask);

// PATCH  /api/tasks/:id/complete - Mark as completed
router.patch("/:id/complete", validateObjectId, completeTask);

module.exports = router;
