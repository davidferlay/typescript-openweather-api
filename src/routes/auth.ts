import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const router = Router();

// TODO: upgrade in favor of real /registration user workflow
router.post("/get-token", (req, res) => {
  const { username, password } = req.body || {};

  // Validate credentials
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username !== config.auth.hardcodedUsername || password !== config.auth.hardcodedPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server configuration error" });
  }
  const payload = { username };
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.json({ token });
});

export default router;

