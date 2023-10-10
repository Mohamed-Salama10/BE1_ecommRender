import { Router } from "express";
import { multerCloudFunction } from "./../../services/multer.cloudinary.js";
import { allowedExtensions } from "./../../util/allowedExtensions.js";
import { asyncHandler } from "./../../util/errorAsyncHandler.js";
import * as pc from "./product.controller.js";
import * as validators from "./product.validation.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
const router = Router();

router.post(
  "/createProduct",
  multerCloudFunction(allowedExtensions.Image).array("images", 3),
  validationCoreFunction(validators.addProductSchema),
  asyncHandler(pc.createProduct)
);

router.put(
  "/updateProduct",
  multerCloudFunction(allowedExtensions.Image).array("images", 2),
  asyncHandler(pc.updateProduct)
);

router.get("/sortProducts", asyncHandler(pc.sortAllProducts));

router.get("/selectSpecificFields", asyncHandler(pc.selectSpecificFields));

router.get("/filters", asyncHandler(pc.filters));

router.get("/apiFeatures", asyncHandler(pc.apiFeatures));

export default router;
