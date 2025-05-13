import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import ragRoutes from "./routes/ragRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    statusCode: 200,
    message: "API is working properly",
    author: "Habib Adebayo",
    date: new Date().getTime(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rag", ragRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});

export default app;
