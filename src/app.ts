import express from "express";
import dotenv from "dotenv";
import weatherRoutes from "./routes/weather";
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/weather", weatherRoutes);
app.use("/", authRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening at port ${port}`));

