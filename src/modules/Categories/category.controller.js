import express from "express";
import slugify from "slugify";
import cloudinary from "../../util/cloudinary.config.js";
import { categoryModel } from "../../../DB/Models/category.models.js";

import { customAlphabet } from "nanoid";
import { log } from "console";
import { subCategoryModel } from "../../../DB/Models/subcategory.models.js";
import path from "path";
import { brandModel } from "./../../../DB/Models/brands.model.js";

const nanoid = customAlphabet("123456_=!ascbhdtel", 5);
// ============================== create category ========================

export const createCategory = async (req, res, next) => {
  // Extract 'name' from the request body
  const { name } = req.body;

  // Extract '_id' from the authenticated user
  const { _id } = req.authUser;

  // Create a slug by replacing spaces in the 'name' with underscores
  const slug = slugify(name, "_");

  // Check if a category with the same 'name' already exists in the database
  if (await categoryModel.findOne({ name })) {
    return next(new Error("Please enter a unique name", { cause: 400 }));
  }

  // Check if a file is uploaded in the request
  if (!req.file) {
    return next(new Error("Please upload a cat image", { cause: 400 }));
  }

  // Generate a custom ID
  const customId = nanoid();

  // Upload the file to Cloudinary and get the secure URL and public ID
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${customId}`,
    }
  );

  // Create a category object with the necessary information
  const categoryObject = {
    name,
    slug,
    Image: {
      secure_url,
      public_id,
    },
    customId,
    createdBy: _id,
  };

  // Create the category in the database
  const category = await categoryModel.create(categoryObject);

  // If the category creation fails, delete the uploaded image from Cloudinary
  if (!category) {
    await cloudinary.uploader.destroy(public_id);
    return next(new Error("try again later"));
  }

  // Send a success response with the created category
  res.status(200).json({ message: "category created", category });
};

// ============================== update category ========================

export const updateCategory = async (req, res, next) => {
  const { _id } = req.authUser; // Get the authenticated user's ID
  const categoryId = req.params.categoryId; // Get the category ID from the request parameters
  log(categoryId); // Log the category ID (assuming 'log' is a defined function)

  const { name } = req.body; // Get the 'name' from the request body

  // Find the category that is required to be changed by ID and the creator's ID
  const category = await categoryModel.findOne({
    _id: categoryId,
    createdBy: _id,
  });

  // Check if the category with the specified ID and creator exists
  if (!category) {
    return next(new Error("Invalid category Id", { cause: 400 }));
  }

  if (name) {
    // Check if the 'name' is different from the old name
    if (category.name == name) {
      return next(
        new Error("Please enter a different name from the old name", {
          cause: 400,
        })
      );
    }

    // Check if the 'name' is unique and not a duplicate in the database
    if (await categoryModel.findOne({ name })) {
      return next(
        new Error("Duplicate name, please enter a unique name", { cause: 400 })
      );
    }

    // Update both the 'name' and 'slug' if the above conditions failed
    category.name = name;
    category.slug = slugify(name, "_"); // Slugify the new name
  }

  // Check if there is any change in the image in the request
  if (req.file) {
    // Delete the old category image using the image's public ID to find it in Cloudinary
    await cloudinary.uploader.destroy(category.Image.public_id);

    // Upload the new image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}`,
      }
    );

    // Update the category's image information in the database
    category.Image = { secure_url, public_id };
  }

  // Set the 'updatedBy' field to the authenticated user's ID
  category.updatedBy = _id;

  // Save the modifications to the database
  await category.save();

  // Respond with a message indicating that the update is done and the updated category
  res.json({ message: "update done", category });
};


// ============================== get all categories with corresponding subCategory using cursor method  ========================

export const getAllCategories = async (req, res, next) => {
  //1- create and empty array to push the data in it
  let categoryArray = [];
  // 2- get the docs using cursor
  const cursor = await categoryModel.find().cursor();
  //3- define the cursor loop
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const subCategory = await subCategoryModel.find({ categoryId: doc._id });
    //4- transform the category from BSON to object to be able to modify on it
    const categoryObject = doc.toObject();
    //5- add the subCategories to the array
    categoryArray.subCategory = subCategory;
    //6- push the category to the array
    categoryArray.push(categoryObject);
  }
  res.status(200).json({ message: "success", categoryArray });
};

// ============================== get all categories with corresponding subCategory using virtual method  ========================

export const getAllCategories2 = async (req, res, next) => {
  //this api gets all categories with the subcategory as virtual

  const categories = await categoryModel
    .find()
    .populate([{ path: "subCategory", populate: [{ path: "brand" }] }]); // nested populate will populate on the subCategory to return also brands
  res.status(200).json({ message: "success", categories });
};

// ============================== Delete category   ================================================
// deleting a category affects multi places like sub category , brands and the image already have an image on the host that needs to be deleted
// delete all related sub categories and its pics on host
// delete all brands and its corresponding logos on host  for each subcategory
export const deleteCategory = async (req, res, next) => {
  const { _id } = req.authUser;
  const { categoryId } = req.query;
  const currentCategory = await categoryModel.findByIdAndDelete({
    _id: categoryId,
    createdBy: _id,
  });
  // check if the
  if (!currentCategory) {
    return next(new Error("category doesnot exist", { cause: 400 }));
  }

  // delete all images from the categorty folder in the host including images inside sub category folders that is inside
  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}`
  );

  // after deleting the files the following line delete the empty folder, the prev step was necessary because to delete a folder it must be empty
  await cloudinary.api.delete_folder(
    `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}`
  );
  //delete the image from host for the category

  await cloudinary.uploader.destroy(currentCategory.Image.public_id);

  // delete the sub categories related to the current category
  const deleteRelatedSubCategories = await subCategoryModel.deleteMany({
    categoryId,
  });
  // delete the brands related to the current category
  // this is possible beacuse  we already stored the categoryId in the brand model
  const deleteRelatedBrands = await brandModel.deleteMany({ categoryId });

  //handle case if the delete fail

  if (!deleteRelatedSubCategories.deletedCount) {
    return next(new Error("delete fail subcategory", { cause: 400 }));
  }

  if (!deleteRelatedBrands.deletedCount) {
    return next(new Error("delete failed brands ", { cause: 400 }));
  }
  //return successResponse
  res.status(200).json({ message: "done" });
};
