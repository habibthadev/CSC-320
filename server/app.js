import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import AppError from "./utils/app-error.js";
import { error as globalErrorHandler } from "./controllers/errorController.js";
import userRouter from "./routes/userRoutes.js";
import documentRouter from "./routes/documnetRoutes.js";
import qaRouter from "./routes/qaRoutes.js";
import "./config/passport.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";

const app = express();

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Haskmee API",
    time: new Date().toISOString(),
    statusCode: 200,
    creator: "Habib Adebayo",
  });
});

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// Use sessions for passport
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// ROUTES;
app.use("/api/users", userRouter);
app.use("/api/documents", documentRouter);
app.use("/api/qa", qaRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
