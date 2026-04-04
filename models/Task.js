const mongoose = require("mongoose");
const { CATEGORIES } = require("../utils/constants");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: "Category must be one of: " + CATEGORIES.join(", "),
      },
      trim: true,
      default: "General",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Task", taskSchema);

