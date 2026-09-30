import mongoose from "mongoose";

export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const classSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: weekdays,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
      validate: {
        validator(endTime) {
          return !this.startTime || endTime > this.startTime;
        },
        message: "End time must be after start time.",
      },
    },
    room: {
      type: String,
      trim: true,
      default: "",
    },
    teacher: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

const Class = mongoose.model("Class", classSchema);

export default Class;