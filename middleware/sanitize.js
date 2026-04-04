/**
 * Sanitizes user input to prevent XSS attacks.
 * Strips HTML tags and trims whitespace from string fields.
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
};

const sanitizeInput = (req, res, next) => {
  if (!req.body) return next();

  const fieldsToSanitize = ["title", "description", "category"];

  fieldsToSanitize.forEach((field) => {
    if (req.body[field] !== undefined && req.body[field] !== null) {
      req.body[field] = sanitizeString(req.body[field]);
    }
  });

  next();
};

module.exports = sanitizeInput;
