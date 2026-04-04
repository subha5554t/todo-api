const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const { ERROR_MESSAGES, PAGINATION } = require("../utils/constants");

// POST /tasks - Create a new task
const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, category } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.TITLE_REQUIRED });
  }

  const task = await Task.create({ title: title.trim(), description, dueDate, category });

  res.status(201).json({ success: true, message: ERROR_MESSAGES.TASK_CREATED, data: task });
});

// GET /tasks - Get all tasks with pagination
const getAllTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const tasks = await Task.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Task.countDocuments();

  res.status(200).json({
    success: true,
    count: tasks.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: tasks,
  });
});

// GET /tasks/:id - Get single task
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
  }

  res.status(200).json({ success: true, data: task });
});

// PUT /tasks/:id - Edit task details
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, category } = req.body;

  if (title !== undefined && title.trim() === "") {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.TITLE_CANNOT_BE_EMPTY });
  }

  // Prevent updating completed status via PUT - use PATCH /complete instead
  const updateData = { title: title?.trim(), description, dueDate, category };
  if (req.body.completed !== undefined) {
    delete req.body.completed; // Ignore completed field in PUT requests
  }

  const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!task) {
    return res.status(404).json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
  }

  res.status(200).json({ success: true, message: ERROR_MESSAGES.TASK_UPDATED, data: task });
});

// PATCH /tasks/:id/complete - Mark task as completed
const completeTask = asyncHandler(async (req, res) => {
  // First check if task exists and is already completed
  const existingTask = await Task.findById(req.params.id);

  if (!existingTask) {
    return res.status(404).json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
  }

  if (existingTask.completed) {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.TASK_ALREADY_COMPLETED });
  }

  // Atomic update to mark as completed
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { completed: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: ERROR_MESSAGES.TASK_COMPLETED, data: task });
});

// DELETE /tasks/:id - Delete a task
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: ERROR_MESSAGES.TASK_NOT_FOUND });
  }

  res.status(200).json({ success: true, message: ERROR_MESSAGES.TASK_DELETED });
});

module.exports = { createTask, getAllTasks, getTaskById, updateTask, completeTask, deleteTask };
