import { Router } from "express";
import { multerCloudFunction } from "../../services/multer.cloudinary.js";
import { allowedExtensions } from "../../util/allowedExtensions.js";
import { asyncHandler } from "../../util/errorAsyncHandler.js";
import * as cc from "./category.controller.js";
import * as validators from "./category.validationSchema.js";
import { validationCoreFunction } from "../../middlewares/validation.js";
import { isAuth } from "../../middlewares/auth.js";
import { systemRoles } from "../../util/systemRoles.js";
const router = Router();
// router to create category
router.post(
  "/createCategory",
  isAuth([systemRoles.admin,systemRoles.superAdmin]),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  //validation must be after multer because in multer presence it is responsible for parsing
  validationCoreFunction(validators.createCategorySchema),

  asyncHandler(cc.createCategory)
);
// router to update the category
router.put(
  "/updateCategory/:categoryId",
  isAuth([systemRoles.admin, systemRoles.superAdmin]),
  multerCloudFunction(allowedExtensions.Image).single("image"),
  validationCoreFunction(validators.createCategorySchema),
  asyncHandler(cc.updateCategory)
);

// router to get all the category
router.get("/getAllCategories", asyncHandler(cc.getAllCategories));

// router to get all the category using virtual method
router.get("/getAllCategories2", asyncHandler(cc.getAllCategories2));

// router to get delete a specific category
router.delete(
  "/deleteCategory",
  isAuth([systemRoles.admin, systemRoles.superAdmin]),
  asyncHandler(cc.deleteCategory)
);

export default router;
