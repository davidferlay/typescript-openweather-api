import express from "express";
import "./config.js"; // Load config/env vars
import weatherRoutes from "./routes/weather.js";
import authRoutes from "./routes/auth.js";
const app = express();
app.use(express.json());

app.use("/weather", weatherRoutes);
app.use("/", authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening at port ${port}`));

