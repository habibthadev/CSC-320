import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import env, {
  SESSION_SECRET,
  PORT,
  NODE_ENV,
  CLIENT_URL,
  CORS_ORIGIN,
} from "./config/env.js";
import passport from "./config/passport.js";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import questionRoutes from "./routes/question.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import oauthRoutes from "./routes/oauth.routes.js";
import { connectToDatabase } from "./config/db.js";
import logger from "./utils/logger.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: CORS_ORIGIN
      ? CORS_ORIGIN.split(",")
      : NODE_ENV === "production"
      ? [CLIENT_URL]
      : ["http://localhost:3000", "http://localhost:5173", CLIENT_URL],
    credentials: true,
  })
);

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  logger.info(
    {
      method: req.method,
      url: req.url,
      userAgent: req.get("user-agent"),
      ip: req.ip,
      headers: {
        authorization: req.headers.authorization ? "Bearer [REDACTED]" : "None",
        contentType: req.headers["content-type"],
      },
    },
    "Incoming request"
  );
  next();
});

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "success",
    statusCode: 200,
    message: "API is working properly",
    author: "Habib Adebayo",
    date: new Date().getTime(),
  });
});

app.get("/health", async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    const dbStatus = states[dbState] || "Unknown";

    res.status(dbState === 1 ? 200 : 500).json({
      status: dbState === 1 ? "success" : "error",
      message: `Database is ${dbStatus.toLowerCase()}`,
      dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to check database health",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rag", ragRoutes);

app.use(errorHandler);

if (NODE_ENV !== "test" && NODE_ENV !== "serverless") {
  const initializeServer = async () => {
    try {
      await connectToDatabase();
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to initialize server:", error);
      process.exit(1);
    }
  };

  initializeServer();
}

export default app;
