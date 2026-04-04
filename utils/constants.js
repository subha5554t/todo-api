// Error messages
const ERROR_MESSAGES = {
  TASK_NOT_FOUND: "Task not found",
  TITLE_REQUIRED: "Title is required and cannot be empty",
  TITLE_CANNOT_BE_EMPTY: "Title cannot be empty",
  INVALID_ID_FORMAT: "Invalid task ID format",
  TASK_ALREADY_COMPLETED: "Task is already marked as completed",
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  TASK_COMPLETED: "Task marked as completed",
  SERVER_ERROR: "Server error",
  ROUTE_NOT_FOUND: "Route not found",
  API_RUNNING: "Todo API is running",
};

// Category options
const CATEGORIES = ["Work", "Personal", "Shopping", "Health", "Finance", "General"];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = { ERROR_MESSAGES, CATEGORIES, PAGINATION };
