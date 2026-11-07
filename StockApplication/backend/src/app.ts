import express from "express";
import cors from "cors";
import stockRoutes from "./routes/stockRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Stock API backend is running."
    });
});

// Stock routes
app.use("/api/stocks", stockRoutes);

export default app;