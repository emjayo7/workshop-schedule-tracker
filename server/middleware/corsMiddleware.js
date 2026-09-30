import cors from "cors";

const localDevelopmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function isAllowedOrigin(origin, frontendUrl = process.env.FRONTEND_URL) {
  if (!origin) {
    return true;
  }

  const allowedOrigins = [...localDevelopmentOrigins];
  if (frontendUrl) {
    allowedOrigins.push(...frontendUrl.split(",").map((value) => value.trim()));
  }

  return allowedOrigins.includes(origin);
}

export function createCorsMiddleware(frontendUrl = process.env.FRONTEND_URL) {
  return cors({
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin, frontendUrl));
    },
    credentials: true,
  });
}