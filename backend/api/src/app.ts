import config from "./config/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./libs/auth";
import authRouter from "./routes/authRoutes"


const app = express();

app.use(cors(config.corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/auth", authRouter);

app.use(express.json())

app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
});
