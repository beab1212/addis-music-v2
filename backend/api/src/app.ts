import config from "./config/config";
import express, { Router } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./libs/auth";
import authRouter from "./routes/authRoutes";
import systemRouter from "./routes/systemRoutes";


const app = express();

app.use(cors(config.corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/auth", authRouter);

app.use(express.json())

const api = Router();
app.use("/api", api);

api.use("/system",systemRouter);



app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
});
