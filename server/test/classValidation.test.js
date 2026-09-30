import test from "node:test";
import assert from "node:assert/strict";
import { validateClassInput } from "../utils/classValidation.js";

const validClass = {
  subjectName: "Programming",
  dayOfWeek: "Monday",
  startTime: "14:00",
  endTime: "15:00",
};

test("accepts a valid class", () => {
  assert.equal(validateClassInput(validClass), null);
});

test("requires a subject name", () => {
  assert.equal(validateClassInput({ ...validClass, subjectName: " " }), "Subject name is required.");
});

test("rejects an unknown weekday", () => {
  assert.equal(validateClassInput({ ...validClass, dayOfWeek: "Funday" }), "Choose a valid day of the week.");
});

test("rejects invalid time formats", () => {
  assert.equal(validateClassInput({ ...validClass, startTime: "2 PM" }), "Enter a valid start time in 24-hour HH:mm format.");
});

test("requires the end time to follow the start time", () => {
  assert.equal(validateClassInput({ ...validClass, endTime: "14:00" }), "End time must be after start time.");
});