import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

const developmentJwtSecret = randomBytes(32).toString("hex");

export function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured in production.");
  }

  return developmentJwtSecret;
}

export function issueAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

export function setAuthCookie(response, user) {
  const token = issueAuthToken(user);
  response.cookie("authToken", token, getCookieOptions());
  return token;
}

export function clearAuthCookie(response) {
  response.clearCookie("authToken", getCookieOptions());
}

export function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, pair) => {
    const [key, ...valueParts] = pair.split("=");
    if (!key) {
      return cookies;
    }

    const cookieName = key.trim();
    const cookieValue = valueParts.join("=").trim();
    if (cookieName) {
      cookies[cookieName] = cookieValue;
    }
    return cookies;
  }, {});
}

export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.cookie || "";
  const cookieValues = parseCookies(cookieHeader);

  if (request.cookies?.authToken) {
    return request.cookies.authToken;
  }

  if (cookieValues.authToken) {
    return cookieValues.authToken;
  }

  const authHeader = request.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}
