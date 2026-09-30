import { weekdays } from "../models/Class.js";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateClassInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "Class details are required.";
  }

  if (typeof input.subjectName !== "string" || !input.subjectName.trim()) {
    return "Subject name is required.";
  }

  if (!weekdays.includes(input.dayOfWeek)) {
    return "Choose a valid day of the week.";
  }

  if (typeof input.startTime !== "string" || !timePattern.test(input.startTime)) {
    return "Enter a valid start time in 24-hour HH:mm format.";
  }

  if (typeof input.endTime !== "string" || !timePattern.test(input.endTime)) {
    return "Enter a valid end time in 24-hour HH:mm format.";
  }

  if (input.endTime <= input.startTime) {
    return "End time must be after start time.";
  }

  for (const optionalField of ["room", "teacher"]) {
    if (input[optionalField] !== undefined && typeof input[optionalField] !== "string") {
      return `${optionalField} must be text.`;
    }
  }

  return null;
}