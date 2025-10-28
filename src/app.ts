import express from "express";
import { config } from "./config.js";
import weatherRoutes from "./routes/weather.js";
import authRoutes from "./routes/auth.js";
import statusRoutes from "./routes/status.js";
import { metricsMiddleware } from "./services/metrics.js";

const app: express.Express = express();
app.use(express.json());
app.use(metricsMiddleware);

app.use("/weather", weatherRoutes);
app.use("/", authRoutes);
app.use("/", statusRoutes);

app.get("/", (_req, res) => {
  res.send("");
});

app.listen(config.server.port, () => console.log(`API listening at port ${config.server.port}`));

