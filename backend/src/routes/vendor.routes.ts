import { Router } from "express";
import { getVendors, createVendor } from "../controllers/vendor.controller";
import { authenticate } from "../middleware/auth";
import { allowRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { createVendorSchema } from "../validations/vendor.validation";

const router = Router();

router.use(authenticate);

router.get("/", getVendors);
router.post("/", allowRoles("OPS"), validate(createVendorSchema), createVendor);

export default router;
