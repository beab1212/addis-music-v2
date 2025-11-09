import config from "./config/config";
import express, { Router } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./libs/auth";
import authRoute from "./routes/authRoutes";
import systemRoute from "./routes/systemRoutes";
import userRouter from "./routes/userRoutes";


const app = express();

app.use(cors(config.corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/auth", authRoute);

app.use(express.json())

const api = Router();
app.use("/api", api);

api.use("/system",systemRoute);
api.use("/user", userRouter);



app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
});
