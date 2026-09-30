import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin } from "../middleware/corsMiddleware.js";

const deployedFrontend = "https://classwork-planner.onrender.com";

test("allows the configured production frontend origin", () => {
  assert.equal(isAllowedOrigin(deployedFrontend, deployedFrontend), true);
});

test("allows localhost development origins", () => {
  assert.equal(isAllowedOrigin("http://localhost:5173", deployedFrontend), true);
  assert.equal(isAllowedOrigin("http://127.0.0.1:5173", deployedFrontend), true);
});

test("rejects origins that are not allowlisted", () => {
  assert.equal(isAllowedOrigin("https://untrusted.example", deployedFrontend), false);
  assert.equal(isAllowedOrigin(deployedFrontend, undefined), false);
});

test("allows requests without an Origin header", () => {
  assert.equal(isAllowedOrigin(undefined, deployedFrontend), true);
});