import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import User from "../models/User.js";
import { getCookieOptions, getJwtSecret } from "../utils/auth.js";
import { updateUserTheme } from "../controllers/authController.js";
import authRoutes from "../routes/authRoutes.js";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("User model hashes and verifies passwords", async () => {
  const user = new User({
    name: "Alice Example",
    email: "alice@example.com",
    password: "SecurePass123!",
  });

  await user.hashPassword();

  assert.notEqual(user.password, "SecurePass123!");
  assert.ok(user.password.startsWith("$2"));
  assert.equal(await user.comparePassword("SecurePass123!"), true);
  assert.equal(await user.comparePassword("wrong-password"), false);
});

test("JWT signing requires a configured secret in production", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;

  try {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = "development";
    assert.match(getJwtSecret(), /^[a-f0-9]{64}$/);

    process.env.NODE_ENV = "production";
    assert.throws(() => getJwtSecret(), /JWT_SECRET must be configured in production/);
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  }
});

test("auth cookies use secure cross-site settings only in production", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    process.env.NODE_ENV = "production";
    const productionOptions = getCookieOptions();
    assert.equal(productionOptions.httpOnly, true);
    assert.equal(productionOptions.secure, true);
    assert.equal(productionOptions.sameSite, "none");
    assert.equal(productionOptions.path, "/");

    process.env.NODE_ENV = "development";
    const developmentOptions = getCookieOptions();
    assert.equal(developmentOptions.httpOnly, true);
    assert.equal(developmentOptions.secure, false);
    assert.equal(developmentOptions.sameSite, "lax");
    assert.equal(developmentOptions.path, "/");
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});

test("User model accepts and persists the pink theme", async () => {
  const user = new User({ name: "Pink User", email: "pink@example.com", password: "SecurePass123!", theme: "pink" });
  await user.validate();
  assert.equal(user.theme, "pink");
});

test("theme update rejects values outside the supported themes", async () => {
  const response = createResponse();
  let saved = false;
  const user = { theme: "light", async save() { saved = true; } };

  await updateUserTheme({ user, body: { theme: "ultraviolet" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(saved, false);
});

test("authenticated theme update saves only request.user and returns a sanitized user", async () => {
  const response = createResponse();
  const authenticatedUser = {
    _id: "authenticated-user-id",
    name: "Alice Example",
    email: "alice@example.com",
    password: "secret-hash",
    theme: "light",
    async save() { this.saved = true; },
    toObject() {
      return { _id: this._id, name: this.name, email: this.email, password: this.password, theme: this.theme };
    },
  };

  await updateUserTheme({
    user: authenticatedUser,
    body: { theme: "pink", userId: "attacker-chosen-id" },
  }, response);

  assert.equal(authenticatedUser.theme, "pink");
  assert.equal(authenticatedUser.saved, true);
  assert.equal(response.body.data.user._id, "authenticated-user-id");
  assert.equal(response.body.data.user.theme, "pink");
  assert.equal("password" in response.body.data.user, false);
  assert.equal("token" in response.body.data, false);
});

test("unauthenticated theme update is rejected by the authenticated route", async (context) => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/theme`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme: "pink" }),
  });

  assert.equal(response.status, 401);
  assert.equal((await response.json()).success, false);
});
