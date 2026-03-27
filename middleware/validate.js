const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (title !== undefined && title.trim() === "") {
    return res.status(400).json({ success: false, message: "Title cannot be empty" });
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
