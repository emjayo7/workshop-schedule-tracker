import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import classRoutes from "./routes/classRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { createCorsMiddleware } from "./middleware/corsMiddleware.js";

const app = express();
const port = process.env.PORT || process.env.port || 5000;

app.use(createCorsMiddleware());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    data: {
      api: "ok",
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api", taskRoutes);

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log("MongoDB connected");
  });
}

startServer().catch((error) => {
  console.error("Could not start the server:", error.message);
  process.exit(1);
});
