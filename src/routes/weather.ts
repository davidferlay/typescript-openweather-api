import { Router } from "express";
import { authMiddleware } from "../services/auth.js";
import { getWeather } from "../services/weather.js";
import { logger } from "../services/logger.js";

const router: Router = Router();

router.get("/:city", authMiddleware, async (req, res) => {
  const city: string | undefined = req.params["city"];
  const hasCityParameter: boolean = Boolean(city);
  if (!hasCityParameter) {
    logger.warn("Weather request missing city parameter");
    return res.status(400).json({ error: "City parameter is required" });
  }

  try {
    const { data, fromCache } = await getWeather(city!);
    const cacheStatus: string = fromCache ? "HIT" : "MISS";
    res.setHeader("X-Cache-Status", cacheStatus);
    return res.json(data);
  } catch (err) {
    const errorMessage: string = err instanceof Error ? err.message : String(err);
    logger.error("Weather route error", { city, error: errorMessage });
    return res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;

