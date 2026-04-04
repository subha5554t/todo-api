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
  describe("POST /api/v1/tasks", () => {
    it("should create a task with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Test Task", description: "Test description" });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Test Task");
      expect(res.body.data.completed).toBe(false);
    });

    it("should reject task with empty title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "   " });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject task with missing title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ description: "No title here" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject task with title exceeding 200 characters", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "a".repeat(201) });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET ALL ──────────────────────────────────────────
  describe("GET /api/v1/tasks", () => {
    it("should return all tasks with pagination", async () => {
      await request(app).post("/api/v1/tasks").send({ title: "Task 1" });
      await request(app).post("/api/v1/tasks").send({ title: "Task 2" });

      const res = await request(app).get("/api/v1/tasks");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(10);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should support pagination parameters", async () => {
      for (let i = 1; i <= 15; i++) {
        await request(app).post("/api/v1/tasks").send({ title: `Task ${i}` });
      }

      const res = await request(app).get("/api/v1/tasks?page=1&limit=5");

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(5);
      expect(res.body.total).toBe(15);
      expect(res.body.totalPages).toBe(3);
    });
  });

  // ─── GET SINGLE ───────────────────────────────────────
  describe("GET /api/v1/tasks/:id", () => {
    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).get("/api/v1/tasks/invalid-id");
      expect(res.statusCode).toBe(400);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── UPDATE ───────────────────────────────────────────
  describe("PUT /api/v1/tasks/:id", () => {
    it("should update a task", async () => {
      const created = await request(app).post("/api/v1/tasks").send({ title: "Old Title" });
      const taskId = created.body.data._id;

      const res = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send({ title: "New Title", description: "Updated" });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.title).toBe("New Title");
    });

    it("should reject update with empty title", async () => {
      const created = await request(app).post("/api/v1/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).put(`/api/v1/tasks/${taskId}`).send({ title: "" });

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).put(`/api/v1/tasks/${fakeId}`).send({ title: "X" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).put("/api/v1/tasks/invalid-id").send({ title: "X" });
      expect(res.statusCode).toBe(400);
    });
  });

  // ─── COMPLETE ─────────────────────────────────────────
  describe("PATCH /api/v1/tasks/:id/complete", () => {
    it("should mark a task as completed", async () => {
      const created = await request(app).post("/api/v1/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).patch(`/api/v1/tasks/${taskId}/complete`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it("should reject completing an already completed task", async () => {
      const created = await request(app).post("/api/v1/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      await request(app).patch(`/api/v1/tasks/${taskId}/complete`);
      const res = await request(app).patch(`/api/v1/tasks/${taskId}/complete`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already/i);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/v1/tasks/${fakeId}/complete`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).patch("/api/v1/tasks/invalid-id/complete");
      expect(res.statusCode).toBe(400);
    });
  });

  // ─── DELETE ───────────────────────────────────────────
  describe("DELETE /api/v1/tasks/:id", () => {
    it("should delete a task", async () => {
      const created = await request(app).post("/api/v1/tasks").send({ title: "Task" });
      const taskId = created.body.data._id;

      const res = await request(app).delete(`/api/v1/tasks/${taskId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/v1/tasks/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await request(app).delete("/api/v1/tasks/invalid-id");
      expect(res.statusCode).toBe(400);
    });
  });
});
