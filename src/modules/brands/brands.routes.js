import { Router } from "express";
import * as bc from "./brands.controller.js";
import { multerCloudFunction } from "../../services/multer.cloudinary.js";
import { allowedExtensions } from "./../../util/allowedExtensions.js";
import { asyncHandler } from "./../../util/errorAsyncHandler.js";
const router = Router();
router.post(
  "/createBrand",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  asyncHandler(bc.createBrand)
);

export default router;
