import { Router } from "express";
import { authMiddleware } from "../services/auth.js";
import { getWeather } from "../services/weather.js";
import { logger } from "../services/logger.js";

const router: Router = Router();

router.get("/:city", authMiddleware, async (req, res) => {
  const city: string | undefined = req.params["city"];
  if (!city) {
    logger.warn("Weather request missing city parameter");
    return res.status(400).json({ error: "City parameter is required" });
  }
  try {
    const { data, fromCache } = await getWeather(city);
    res.setHeader("X-Cache-Status", fromCache ? "HIT" : "MISS");
    return res.json(data);
  } catch (err) {
    logger.error("Weather route error", { city, error: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;

