import test from "node:test";
import assert from "node:assert/strict";
import User from "../models/User.js";
import { getJwtSecret } from "../utils/auth.js";

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
