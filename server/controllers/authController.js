import User from "../models/User.js";
import { clearAuthCookie, setAuthCookie } from "../utils/auth.js";

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const plainUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
}

export async function registerUser(request, response) {
  const name = String(request.body?.name || "").trim();
  const email = String(request.body?.email || "").trim().toLowerCase();
  const password = String(request.body?.password || "");

  if (!name || !email || !password) {
    return response.status(400).json({
      success: false,
      message: "Name, email, and password are required.",
    });
  }

  if (password.length < 8) {
    return response.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(409).json({
      success: false,
      message: "An account with that email already exists.",
    });
  }

  const user = await User.create({ name, email, password });
  const token = setAuthCookie(response, user);

  return response.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
}

export async function loginUser(request, response) {
  const email = String(request.body?.email || "").trim().toLowerCase();
  const password = String(request.body?.password || "");

  if (!email || !password) {
    return response.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return response.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return response.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const token = setAuthCookie(response, user);

  return response.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
}

export function logoutUser(_request, response) {
  clearAuthCookie(response);
  return response.json({
    success: true,
    data: { loggedOut: true },
  });
}

export function getCurrentUser(request, response) {
  return response.json({
    success: true,
    data: { user: sanitizeUser(request.user) },
  });
}
