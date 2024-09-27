const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

let token;
let userId;

beforeEach(async () => {
  const user = await User.create({
    name: "Test User",
    email: `test${Date.now()}@example.com`, // Ensure unique email
    password: "password123",
  });
  userId = user._id;
  token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
});

describe("Task Endpoints", () => {
  it("should create a new task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "This is a test task",
        column: "To Do",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Test Task");
    expect(res.body.column).toBe("To Do");
    expect(res.body.user.toString()).toBe(userId.toString());
  });

  it("should not create a task without a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "This is a test task",
        column: "To Do",
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should get all tasks for a user", async () => {
    await Task.create([
      { title: "Task 1", column: "To Do", user: userId },
      { title: "Task 2", column: "In Progress", user: userId },
    ]);

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(2);
  });

  it("should update a task", async () => {
    const task = await Task.create({
      title: "Original Task",
      description: "This is the original task",
      column: "To Do",
      user: userId,
    });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Task",
        column: "In Progress",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Task");
    expect(res.body.column).toBe("In Progress");
    expect(res.body.description).toBe("This is the original task");
  });

  it("should delete a task", async () => {
    const task = await Task.create({
      title: "Task to Delete",
      column: "To Do",
      user: userId,
    });

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});
