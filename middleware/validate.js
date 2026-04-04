const { ERROR_MESSAGES } = require("../utils/constants");

const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ success: false, message: ERROR_MESSAGES.TITLE_REQUIRED });
  }

  if (title.length > 200) {
    return res.status(400).json({ success: false, message: "Title cannot exceed 200 characters" });
  }

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: "Invalid task ID format" });
  }
  next();
};

module.exports = { validateTask, validateObjectId };
