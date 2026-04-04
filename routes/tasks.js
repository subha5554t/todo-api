const express = require("express");
const router = express.Router();
const { validateObjectId, validateTask } = require("../middleware/validate");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  completeTask,
  deleteTask,
} = require("../controllers/taskController");

// POST   /api/v1/tasks        - Create a task
// GET    /api/v1/tasks        - Get all tasks
router.route("/").post(validateTask, createTask).get(getAllTasks);

// GET    /api/v1/tasks/:id    - Get single task
// PUT    /api/v1/tasks/:id    - Edit task
// DELETE /api/v1/tasks/:id    - Delete task
router
  .route("/:id")
  .get(validateObjectId, getTaskById)
  .put(validateObjectId, updateTask)
  .delete(validateObjectId, deleteTask);

// PATCH  /api/v1/tasks/:id/complete - Mark as completed
router.patch("/:id/complete", validateObjectId, completeTask);

module.exports = router;
