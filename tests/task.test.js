const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const TEST_MONGO_URI = "mongodb://localhost:27017/todo-api-test";

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Task API", () => {
  // ─── CREATE ───────────────────────────────────────────
  describe("POST /api/tasks", () => {
    it("should create a task with valid data", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task", description: "Test description" });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Test Task");
      expect(res.body.data.completed).toBe(false);
    });

    it("should reject task with empty title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "   " });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject task with missing title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ description: "No title here" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET ALL ──────────────────────────────────────────
  describe("GET /api/tasks", () => {
    it("should return all tasks", async () => {
      await request(app).post("/api/tasks").send({ title: "Task 1" });
      await request(app).post("/api/tasks").send({ title: "Task 2" });

      const res = await request(app).get("/api/tasks");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── UPDATE ───────────────────────────────────────────
  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const created = await request(app).post("/api/tasks").send({ title: "Old Title" });
      const taskId = created.body.data._id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: "New Title", description: "Updated" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe("New Title");
    });

    it("should reject update with empty title", async () => {
      const created = await request(app).post("/api/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).put(`/api/tasks/${taskId}`).send({ title: "" });

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/tasks/${fakeId}`).send({ title: "X" });
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── COMPLETE ─────────────────────────────────────────
  describe("PATCH /api/tasks/:id/complete", () => {
    it("should mark a task as completed", async () => {
      const created = await request(app).post("/api/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).patch(`/api/tasks/${taskId}/complete`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it("should reject completing an already completed task", async () => {
      const created = await request(app).post("/api/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      await request(app).patch(`/api/tasks/${taskId}/complete`);
      const res = await request(app).patch(`/api/tasks/${taskId}/complete`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already/i);
    });
  });

  // ─── DELETE ───────────────────────────────────────────
  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const created = await request(app).post("/api/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).delete(`/api/tasks/${taskId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).delete("/api/tasks/invalid-id");
      expect(res.statusCode).toBe(400);
    });
  });
});
