# Todo API — Task Management REST API

A RESTful Task Management API built with **Node.js**, **Express**, and **MongoDB** as part of the Node.js Internship Practical (PR: NODEJSIIP-01909).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Running Tests](#running-tests)

---

## Tech Stack

| Tool       | Purpose              |
|------------|----------------------|
| Node.js    | Runtime              |
| Express.js | Web framework        |
| MongoDB    | Database             |
| Mongoose   | ODM for MongoDB      |
| dotenv     | Environment variables|
| cors       | Cross-Origin support |
| Jest       | Unit testing         |
| Supertest  | HTTP test assertions |

---

## Features

- Create tasks with title and description
- View all tasks
- Edit task details (title, description, due date, category)
- Mark tasks as completed (prevents re-completing)
- Delete tasks
- Input validation with meaningful error messages
- Bonus: Due dates, categories, and unit tests

---

## Project Structure

```
todo-api/
├── app.js                    # Entry point — Express setup & DB connection
├── models/
│   └── Task.js               # Mongoose Task schema
├── routes/
│   └── tasks.js              # Route definitions
├── controllers/
│   └── taskController.js     # Business logic for all task operations
├── middleware/
│   └── validate.js           # Input validation & ObjectId format check
├── tests/
│   └── task.test.js          # Jest + Supertest unit tests
├── .env.example              # Sample environment config
├── .gitignore
└── package.json
```

### Key Design Decisions

- **MVC pattern** — Routes, Controllers, and Models are separated for clean maintainability.
- **Middleware validation** — ObjectId format is checked before hitting the DB, avoiding Mongoose cast errors.
- **`findByIdAndUpdate` with `{ new: true }`** — Returns the updated document directly.
- **`task.save()` for complete** — Fetches the task first to check if it's already completed before saving, enforcing the business rule.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/todo-api.git
cd todo-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/todo-api
```

> For **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/todo-api`

### 4. Start the server

```bash
# Production
npm start

# Development (auto-restart on changes)
npm run dev
```

Server runs at: `http://localhost:5000`

---

## API Endpoints

### Base URL: `http://localhost:5000/api`

---

### ✅ Create a Task

**POST** `/tasks`

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueDate": "2025-12-31",
  "category": "Personal"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "665abc123def456789",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "dueDate": "2025-12-31T00:00:00.000Z",
    "category": "Personal",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```

**Validation Error (400):**
```json
{ "success": false, "message": "Title is required and cannot be empty" }
```

---

### 📋 Get All Tasks

**GET** `/tasks`

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [ { ... }, { ... } ]
}
```

---

### 🔍 Get Single Task

**GET** `/tasks/:id`

**Response (200):**
```json
{
  "success": true,
  "data": { "_id": "...", "title": "Buy groceries", ... }
}
```

---

### ✏️ Edit Task

**PUT** `/tasks/:id`

**Request Body** (any fields to update):
```json
{
  "title": "Buy groceries and snacks",
  "category": "Shopping"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { ... }
}
```

---

### ✔️ Mark Task as Completed

**PATCH** `/tasks/:id/complete`

**Response (200):**
```json
{
  "success": true,
  "message": "Task marked as completed",
  "data": { "completed": true, ... }
}
```

**Already Completed Error (400):**
```json
{ "success": false, "message": "Task is already marked as completed" }
```

---

### 🗑️ Delete Task

**DELETE** `/tasks/:id`

**Response (200):**
```json
{ "success": true, "message": "Task deleted successfully" }
```

---

## Error Handling

| Status | Meaning                       |
|--------|-------------------------------|
| 200    | Success                       |
| 201    | Resource created              |
| 400    | Validation error / Bad request|
| 404    | Task not found                |
| 500    | Internal server error         |

All error responses follow this format:
```json
{ "success": false, "message": "Descriptive error message" }
```

---

## Running Tests

Make sure MongoDB is running, then:

```bash
npm test
```

Tests cover:
- Task creation with valid/invalid data
- Empty title rejection
- Fetching all tasks
- Updating tasks
- Preventing double-completion
- Deleting tasks
- Invalid ID format handling
