const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Auth Endpoints", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test${Date.now()}@example.com`, // Ensure unique email
        password: "password123",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user.name).toBe("Test User");
    expect(res.body.user.email).toMatch(/@example.com$/);
  });

  it("should not register a user with an existing email", async () => {
    const email = `existing${Date.now()}@example.com`; // Ensure unique email
    await User.create({
      name: "Existing User",
      email: email,
      password: "existingpass",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: email,
      password: "password123",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should login a user", async () => {
    const email = `login${Date.now()}@example.com`; // Ensure unique email
    await User.create({
      name: "Login User",
      email: email,
      password: "loginpass123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: email,
      password: "loginpass123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user.email).toBe(email);
  });

  it("should not login with incorrect credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
