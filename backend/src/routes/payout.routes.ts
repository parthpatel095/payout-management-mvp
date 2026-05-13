import { Router } from "express";
import {
  getPayouts,
  getPayoutById,
  createPayout,
  submitPayout,
  approvePayout,
  rejectPayout,
} from "../controllers/payout.controller";
import { authenticate } from "../middleware/auth";
import { allowRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { createPayoutSchema, rejectPayoutSchema } from "../validations/payout.validation";

const router = Router();

router.use(authenticate);

router.get("/", getPayouts);
router.get("/:id", getPayoutById);
router.post("/", allowRoles("OPS"), validate(createPayoutSchema), createPayout);
router.post("/:id/submit", allowRoles("OPS"), submitPayout);
router.post("/:id/approve", allowRoles("FINANCE"), approvePayout);
router.post("/:id/reject", allowRoles("FINANCE"), validate(rejectPayoutSchema), rejectPayout);

export default router;
