const Task = require("../models/Task");

// POST /tasks - Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, category } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title is required and cannot be empty" });
    }

    const task = await Task.create({ title: title.trim(), description, dueDate, category });

    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /tasks - Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /tasks/:id - Get single task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PUT /tasks/:id - Edit task details
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, category } = req.body;

    if (title !== undefined && title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title: title?.trim(), description, dueDate, category },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task updated successfully", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// PATCH /tasks/:id/complete - Mark task as completed
const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (task.completed) {
      return res.status(400).json({ success: false, message: "Task is already marked as completed" });
    }

    task.completed = true;
    await task.save();

    res.status(200).json({ success: true, message: "Task marked as completed", data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// DELETE /tasks/:id - Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, completeTask, deleteTask };
