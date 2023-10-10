import slugify from "slugify";
import { brandModel } from "../../../DB/Models/brands.model.js";
import { categoryModel } from "../../../DB/Models/category.models.js";
import { subCategoryModel } from "../../../DB/Models/subcategory.models.js";
import cloudinary from "../../util/cloudinary.config.js";
import { nanoid } from "nanoid";

export const createBrand = async (req, res, next) => {
  const { _id } = req.authUser;
  const { name } = req.body;
  const { subCategoryId, categoryId } = req.query;
  console.log(categoryId, subCategoryId);
  // check if category do exist
  const currentCategory = await categoryModel.findById(categoryId);
  const currentSubCategory = await subCategoryModel.findById(subCategoryId);
  if (!currentCategory) {
    return next(new Error("invalid categoryId ", { cause: 400 }));
  }
  // check if sub category do exist
  if (!currentSubCategory) {
    return next(new Error("invalid subcategoryId ", { cause: 400 }));
  }

  // create slug of the brands
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });
  // image upload part
  // create custom id
  const customId = nanoid();

  // check if there is any file with req
  if (!req.file) {
    return next(new Error("please upload an image", { cause: 400 }));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}/subCategories/${currentCategory.customId}/Brands/${customId}`,
    }
  );

  //create the object to be save to the db
  const brandObject = {
    name,
    slug,
    Image: { secure_url, public_id },
    categoryId,
    subCategoryId,
    customId,
  };
  const brandDb = await brandModel.create(brandObject);

  // if the document is not generated delete the image
  if (!brandDb) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("try again later ", { cause: 400 }));
  }
  // if everything is ok return response
  res.status(200).json({ message: "success", brandDb });
};
