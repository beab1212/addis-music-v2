import config from "./config/config";
import express, { Router } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import prisma from "./libs/db";
import meiliClient, { checkMeiliConnection } from "./libs/meili";
import { auth } from "./libs/auth";
import { errorHandler } from "./middlewares/errorHandler";
import authRoute from "./routes/authRoutes";
import systemRoute from "./routes/systemRoutes";
import userRoute from "./routes/userRoutes";
import genreRoute from "./routes/genreRoutes";
import artistRoute from "./routes/artistRoutes";
import albumRoute from "./routes/albumRoutes";
import playlistRoute from "./routes/playlistRoutes";
import playlistTrackRoute from "./routes/playlistItemRoutes";
import tagRoute from "./routes/tagRoutes";
import trackLikeRoute from "./routes/trackLikeRoutes";
import playHistoryRoute from "./routes/playHistoryRoutes";
import artistFollowRoute from "./routes/artistFollowRoutes";
import userFollowRoute from "./routes/userFollowRouter";
import trackRoute from "./routes/trackRoutes";
import streamRoute from "./routes/streamRoutes";


const app = express();


app.use(cors(config.corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use("/api/auth", authRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/stream", streamRoute);

const api = Router();
app.use("/api", api);


api.use("/system",systemRoute);
api.use("/user", userRoute);
api.use("/genres", genreRoute);
api.use("/artists", artistRoute);
api.use("/albums", albumRoute);
api.use("/playlists", playlistRoute);
api.use("/playlist-items", playlistTrackRoute);
api.use("/tags", tagRoute);
// main track route here
api.use("/track-likes", trackLikeRoute);
api.use("/play-history", playHistoryRoute);
api.use("/artist-follows", artistFollowRoute);
api.use("/user-follows", userFollowRoute);
api.use("/tracks", trackRoute);


app.use(errorHandler);


app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`);
    checkMeiliConnection();
});
