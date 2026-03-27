const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (title !== undefined && title.trim() === "") {
    return res.status(400).json({ success: false, message: "Title cannot be empty" });
  }

  next();
};



module.exports = { validateTask, validateObjectId };
