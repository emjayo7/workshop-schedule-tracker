import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const userThemes = ["light", "dark", "system", "pink"];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    theme: {
      type: String,
      enum: userThemes,
      default: "light",
    },
  },
  { timestamps: true },
);

userSchema.methods.hashPassword = async function hashPassword() {
  if (!this.password) {
    return this.password;
  }

  this.password = await bcrypt.hash(this.password, 12);
  return this.password;
};

userSchema.pre("save", async function hashUserPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const plainUser = this.toObject();
  delete plainUser.password;
  return plainUser;
};

const User = mongoose.model("User", userSchema);

export default User;
