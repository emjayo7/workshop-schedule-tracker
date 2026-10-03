import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret, getTokenFromRequest } from "../utils/auth.js";

export async function authMiddleware(request, response, next) {
  const token = getTokenFromRequest(request);

  if (!token) {
    return response.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }

    request.user = user;
    return next();
  } catch {
    return response.status(401).json({
      success: false,
      message: "Your session is invalid or expired.",
    });
  }
}
