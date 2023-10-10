import { Router } from "express";
import * as cc from "./coupons.controller.js";
import { multerCloudFunction } from "../../services/multer.cloudinary.js";
import { allowedExtensions } from "./../../util/allowedExtensions.js";
import { asyncHandler } from "./../../util/errorAsyncHandler.js";
import * as validators from "./coupon.validationSchema.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "./../../middlewares/auth.js";
import { systemRoles } from "../../util/systemRoles.js";

const router = Router();
router.post(
  "/createCoupon",
  isAuth([systemRoles.admin, systemRoles.superAdmin]),
  validationCoreFunction(validators.addCouponSchema),
  asyncHandler(cc.createCoupon)
);
router.delete(
  "/deleteCoupon",
  isAuth([systemRoles.admin, systemRoles.superAdmin]),
  validationCoreFunction(validators.deleteCouponSchema),
  asyncHandler(cc.deleteCoupon)
);
export default router;
