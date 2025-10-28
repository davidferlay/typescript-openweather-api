import express from "express";
import "./config.js"; // Load config/env vars
import weatherRoutes from "./routes/weather.js";
import authRoutes from "./routes/auth.js";
import statusRoutes from "./routes/status.js";
import { metricsMiddleware } from "./services/metrics.js";

const app = express();
app.use(express.json());
app.use(metricsMiddleware);

app.use("/weather", weatherRoutes);
app.use("/", authRoutes);
app.use("/", statusRoutes);

app.get("/", (req, res) => {
  res.send("");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening at port ${port}`));

