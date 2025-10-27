import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

/* TODO: Remove in favor of real /registration user workflow */
router.post("/get-token", (req, res) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "Server configuration error" });
  }
  const payload = { userId: 1, username: "demo" }; // example user
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });
  res.json({ token });
});

export default router;

