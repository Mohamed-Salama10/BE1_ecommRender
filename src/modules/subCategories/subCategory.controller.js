import slugify from "slugify";

import { categoryModel } from "../../../DB/Models/category.models.js";
import { subCategoryModel } from "./../../../DB/Models/subcategory.models.js";
import cloudinary from "../../util/cloudinary.config.js";
import { nanoid } from "nanoid";
import { userModel } from "../../../DB/Models/user.model.js";

// ============================== create category ========================
export const createSubCategory = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  const { _id } = req.authUser;
  const { name } = req.body;
  // check categoryId
  const currentCategory = await categoryModel.findById(categoryId);
  if (!currentCategory) {
    return next(new Error("invalid categoryID", { cause: 400 }));
  }


  //check name is unique
  if (await subCategoryModel.findOne({ name })) {
    return next(
      new Error("duplicate name please enter another name", { cause: 400 })
    );
  }

  //generate slug
  const slug = slugify(name, "_");

  // image upload
  if (!req.file) {
    return next(
      new Error("Please upload a subCategory  image", { cause: 400 })
    );
  }
  const customId = nanoid();
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}/subCategories/${customId}`,
    }
  );

  // db uploading

  const subCategoryObject = {
    name,
    slug,
    Image: {
      secure_url,
      public_id,
    },
    customId,
    categoryId,
    createdBy:_id
  };

  const subCategory = await subCategoryModel.create(subCategoryObject);
  if (!subCategory) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("try again later"));
  }
  res.status(201).json({ message: "success", subCategory });
};

// ============================== update  subCategory ========================

// ============================== get all  subCategory ========================

export const getAllSubCategories = async (req, res, next) => {
  const allSubCats = await subCategoryModel.find().populate("categoryId");
  res.status(200).json({ message: "success", allSubCats });
};
