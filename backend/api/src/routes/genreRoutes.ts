import { Router } from "express";
import { authorize } from "../middlewares/authorize";
import { requireAuth } from "../middlewares/authMiddleware";
import { genreController } from "../controllers/genreController";

const router = Router();

router.post("/", requireAuth, authorize("admin"), genreController.createGenre);
router.get("/", genreController.getGenres);
router.get("/:id", genreController.getGenreById);
router.put("/:id", requireAuth, authorize("admin"), genreController.updateGenre);
router.delete("/:id", requireAuth, authorize("admin"), genreController.deleteGenre);

export default router;
