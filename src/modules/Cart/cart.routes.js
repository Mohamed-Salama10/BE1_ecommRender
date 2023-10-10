import { Router } from "express";
import * as cartController from "./cart.controller.js";
import { asyncHandler } from "./../../util/errorAsyncHandler.js";
import { isAuth } from "./../../middlewares/auth.js";
import { systemRoles } from "../../util/systemRoles.js";

const router = Router();

router.post(
  "/addToCart",
  isAuth([systemRoles.user]),
  asyncHandler(cartController.addToCart)
);
router.delete(
  "/deleteFormCart",
  isAuth([systemRoles.user]),
  asyncHandler(cartController.deleteFromCart)
);
export default router;
