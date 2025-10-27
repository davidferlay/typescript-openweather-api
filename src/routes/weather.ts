import { Router } from "express";
import { authMiddleware } from "../services/auth.js";
import { getWeather } from "../services/weather.js";

const router = Router();

router.get("/:city", authMiddleware, async (req, res) => {
  const city = req.params.city;
  if (!city) {
    return res.status(400).json({ error: "City parameter is required" });
  }
  try {
    const weatherData = await getWeather(city);
    res.json(weatherData);
  } catch (err) {
    res.status(500).json({ error: "Weather fetch failed" });
  }
});

export default router;

