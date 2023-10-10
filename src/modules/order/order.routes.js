import { Router } from "express";
import * as oc from "./order.controller.js";
import { isAuth } from "./../../middlewares/auth.js";
import { asyncHandler } from "./../../util/errorAsyncHandler.js";
import { systemRoles } from "../../util/systemRoles.js";
const router = Router();
router.post(
  "/createOrder",
  isAuth([systemRoles.user]),
  asyncHandler(oc.createOrder)
);
router.post("/fromCartToOrder", isAuth([systemRoles.user]), asyncHandler(oc.fromCartToOrder));
export default router;
