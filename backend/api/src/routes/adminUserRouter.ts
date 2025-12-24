import { Router } from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import { adminUserController } from "../controllers/adminUserController";


const router = Router();

router.post("/list-users", requireAuth, authorize(['admin']), adminUserController.listUsers);
router.post("/set-role/", requireAuth, authorize(['admin']), adminUserController.setRole);
router.post("/set-user-password/", requireAuth, authorize(['admin']), adminUserController.setUserPassword);
router.post("/ban-user/", requireAuth, authorize(['admin']), adminUserController.banUser);
router.post("/unban-user/", requireAuth, authorize(['admin']), adminUserController.unBanUser);
router.post("/list-user-sessions/", requireAuth, authorize(['admin']), adminUserController.listUserSessions);
router.post("/revoke-user-session/", requireAuth, authorize(['admin']), adminUserController.revokeUserSession);
router.post("/revoke-user-sessions/", requireAuth, authorize(['admin']), adminUserController.revokeAllUserSessions);
router.post("/impersonate-user/", requireAuth, authorize(['admin']), adminUserController.impersonateUser);
router.post("/stop-impersonating/", requireAuth, authorize(['admin']), adminUserController.stopImpersonation);
router.post("/remove-user/", requireAuth, authorize(['admin']), adminUserController.removeUser);

export default router;
