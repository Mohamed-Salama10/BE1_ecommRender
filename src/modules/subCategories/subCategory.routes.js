import { Router } from "express";
import * as scc from "./subCategory.controller.js";
import { multerCloudFunction } from "../../services/multer.cloudinary.js";
import { allowedExtensions } from "../../util/allowedExtensions.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import * as validators from "./subCategory.validationSchema.js";
import { asyncHandler } from "../../util/errorAsyncHandler.js";
import { isAuth } from "../../middlewares/auth.js";
import { systemRoles } from "../../util/systemRoles.js";

const router = Router();

router.post(
  "/createSubCategory/:categoryId",
  multerCloudFunction(allowedExtensions.Image).single("image"),
  isAuth([systemRoles.admin,systemRoles.superAdmin]),
  //validation must be after multer because in multer presence it is responsible for parsing
  validationCoreFunction(validators.createSubCategorySchema),

  asyncHandler(scc.createSubCategory)
);

router.get("/getAllSubCategories", asyncHandler(scc.getAllSubCategories));

export default router;
