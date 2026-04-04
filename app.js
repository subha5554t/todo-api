require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const taskRoutes = require("./routes/tasks");
const { ERROR_MESSAGES } = require("./utils/constants");
const sanitizeInput = require("./middleware/sanitize");

const app = express();

// Security middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Request logging middleware
app.use(morgan("dev"));

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(sanitizeInput);

// Routes
app.use("/api/v1/tasks", taskRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: ERROR_MESSAGES.API_RUNNING });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: ERROR_MESSAGES.ROUTE_NOT_FOUND });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR, error: err.message });
});

// Database connection function
const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo-api";
  return mongoose.connect(MONGO_URI);
};

// Start server function
const startServer = (callback) => {
  const PORT = process.env.PORT || 5000;
  return app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (callback) callback();
  });
};

// Auto-start only if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("MongoDB connected");
      startServer();
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = { app, connectDB, startServer };
