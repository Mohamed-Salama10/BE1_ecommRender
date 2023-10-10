import slugify from "slugify";
import { brandModel } from "../../../DB/Models/brands.model.js";
import { categoryModel } from "../../../DB/Models/category.models.js";
import { subCategoryModel } from "../../../DB/Models/subcategory.models.js";
import cloudinary from "../../util/cloudinary.config.js";
import { nanoid } from "nanoid";
import { productModel } from "../../../DB/Models/product.model.js";
import { paginationFunction } from "../../util/pagination.js";
import { json } from "stream/consumers";
import { ApiFeatures } from "../../util/apiFeattures.js";

// ============================== create product   ================================================

export const createProduct = async (req, res, next) => {
  const { title, description, price, appliedDiscount, colors, sizes, stock } =
    req.body;
  const { categoryId, subCategoryId, brandId } = req.query;
  const { _id } = req.authUser;

  // check if brand, subCategory and category exist
  const currentCategory = await categoryModel.findById(categoryId);

  const currentBrand = await brandModel.findById(brandId);

  if (!currentCategory) {
    return next(new Error("invalid categorz ", { cause: 400 }));
  }

  const currentSubCategory = await subCategoryModel.findById(subCategoryId);

  if (!currentSubCategory) {
    return next(new Error("invalid sub category ", { cause: 400 }));
  }

  if (!currentBrand) {
    return next(new Error("invalid brand ", { cause: 400 }));
  }

  // create slug for name
  const slug = slugify(title, "_");

  // calculate applied discount  if no discount it will be same as price

  const priceAfterDiscount = price - price * ((appliedDiscount || 0) / 100);
  if (!req.files) {
    return next(new Error("please upload image", { cause: 400 }));
  }
  //generate customId for product

  const customId = nanoid();

  // upload images
  const publicIds = []; // publicIds array to store publicIds so in case of failure we can mass delete all uploaded failures
  const Images = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}/subCategories/${currentCategory.customId}/Brands/${currentBrand.customId}/Products/${customId}`,
      }
    );

    //push into the image array the {secure_url,public_id}

    Images.push({ secure_url, public_id });

    publicIds.push(public_id);
  }

  // create the product object to be pushed to the db
  const productObjet = {
    title,
    slug,
    description,
    colors,
    sizes,
    stock,
    categoryId,
    subCategoryId,
    brandId,
    images: Images,
    customId,
    appliedDiscount,
    priceAfterDiscount,
    createdBy: _id,
  };

  // handling the case of api faliure before creating, sending the path to the async handler to delete the uploaded file

  req.imagePath = `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}/subCategories/${currentCategory.customId}/Brands/${currentBrand.customId}/Products/${customId}`;

  const product = await productModel.create(productObjet);

  // check if the product was not created then delete all uploaded images
  if (!product) {
    await cloudinary.uploader.api.delete_resources(publicIds);
    return next(new Error("try again later", { cause: 400 }));
  }

  res.status(200).json({ message: "success", product });
};

// ============================== update product   ================================================

export const updateProduct = async (req, res, next) => {
  const { title, description, price, appliedDiscount, colors, sizes, stock } =
    req.body;
  const { brandId, subCategoryId, categoryId, productId } = req.query;
  const { _id } = req.authUser;
  // checking for the validity of categories, sub categories and brnads
  const currentProduct = await productModel.findById(productId);

  if (!currentProduct) {
    return next(new Error("invalid product id ", { cause: 400 }));
  }

  const currentSubCategory = await subCategoryModel.findById(subCategoryId);

  if (!currentSubCategory) {
    return next(new Error("invalid subCategory id ", { cause: 400 }));
  }
  currentProduct.subCategoryId = subCategoryId;

  const currentBrand = await brandModel.findById(brandId);
  if (!currentBrand) {
    return next(new Error("invlaid brand id", { cause: 400 }));
  }

  currentProduct.brandId = brandId;

  const currentCategory = await categoryModel.findById(categoryId);
  if (!currentCategory) {
    return next(new Error("invalid category id", { cause: 400 }));
  }
  currentBrand.categoryId = categoryId;

  //check if there is price and discount means he want to modifiy both price and discount
  if (appliedDiscount && appliedDiscount) {
    const priceAfterDiscount = price * (1 - (appliedDiscount || 0) / 100);
    currentProduct.priceAfterDiscount = priceAfterDiscount;
  }
  //  if there is only price means the price is to be modified and then apply to it the existing discount
  else if (price) {
    const priceAfterDiscount =
      price * (1 - (currentProduct.appliedDiscount || 0) / 100);
    currentProduct.priceAfterDiscount = priceAfterDiscount;
  }

  //  if there is only discount  means apply new discount to existing price
  else if (appliedDiscount) {
    const priceAfterDiscount =
      currentProduct.price * (1 - (currentProduct.price || 0) / 100);
    currentProduct.priceAfterDiscount = priceAfterDiscount;
  }

  // check if there are images to be updated and update them

  if (req.files?.length) {
    let Images = [];
    for (const file of req.files) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${currentCategory.customId}/subCategories/${currentCategory.customId}/Brands/${currentBrand.customId}/Products/${currentProduct.customId}`,
        }
      );
      Images.push({ secure_url, public_id });
    }
    // get the prev images in an array to allow for mass deletion
    let publicIds = [];
    for (const Image of currentProduct.images) {
      publicIds.push(Image.public_id);
    }

    await cloudinary.api.delete_resources(publicIds);
    currentProduct.images = Images;
  }

  // update the remaining infos

  if (title) {
    currentProduct.title = title;
    currentProduct.slug = slugify(title, "-");
  }
  currentProduct.colors = colors ? colors : currentProduct.colors;
  currentProduct.size = sizes ? sizes : currentProduct.size;
  currentProduct.stock = stock ? stock : currentProduct.stock;
  currentProduct.description = description
    ? description
    : currentProduct.description;
  currentProduct.updatedBy = _id ? _id : currentProduct.updatedBy;

  // save changes to the product
  const updatedProduct = await currentProduct.save();
  res.status(200).json({ message: "success", updatedProduct });
};

// ============================== get all  products   ================================================

export const getAllProducts = async (req, res, next) => {
  const { page, size } = req.query;

  const { limit, skip } = paginationFunction({ page, size });
  // limit() and skip()  moongose function that will take the limit and skip value and return the required data
  const products = await productModel.find().limit(limit).skip(skip);
  res.status(200).json({ message: "success", products });
};

// ============================== get product by title    ================================================

export const getProductByTitle = async (req, res, next) => {
  const { title } = req.query;
  // $regex is moongose operator that will search title that contain the ptovided title , $option :"i" means donot be senstive to lower and upper case
  const products = await productModel
    .find({
      title: { $regex: title, $option: "i" },
    })
    .limit(limit)
    .skip(skip);
  res.status(200).json({ message: "success", products });
};

// ============================== sort all products     ================================================
export const sortAllProducts = async (req, res, next) => {
  let { sort } = req.query;
  sort = sort.replaceAll(",", " ");
  const sortedProducts = await productModel.find().sort(sort);
  res.status(200).json({ message: "success", sortedProducts });
};

// ============================== select all products with specific field      ================================================
export const selectSpecificFields = async (req, res, next) => {
  let { select } = req.query;
  select = select.replaceAll(",", " ");

  const selectedProducts = await productModel.find().select(select);
  res.status(200).json({ message: "success", selectedProducts });
};

// ============================== search in db     ================================================
export const search = async (req, res, next) => {
  // search for a specif thing in db using a specific input
  const { search } = req.query;

  const searchedProducts = await productModel.find({
    $or: [
      { title: { $regex: search, $option: "i" } },
      { description: { $regex: search, $option: "i" } },
    ],
  });
  res.status(200).json({ message: "success", searchedProducts });
};

// ============================== filter the products with specific filters     ================================================
export const filters = async (req, res, next) => {
  // search for a specif thing in db using a specific input
  const filterInstance = { ...req.query };

  //exclude send words that may cause a problem when sent to the query like sort and search
  const excludeArray = ["page", "size", "sort", "select", "search"];
  excludeArray.forEach((key) => filterInstance.delete[key]);

  // creating a regex to pass over the all excpected operator and when find match return it after adding $ to be sent to db
  const filterString = JSON.parse(
    JSON.stringify(filterInstance).replace(
      /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
      (match) => `$${match}`
    )
  );
  const filteredProducts = await productModel.find(filterString);
  res.status(200).json({ message: "success", filteredProducts });
};

// ============================== sort using api featureClass       ================================================

export const apiFeatures = async (req, res, next) => {
  if (req.query.sort) {
    const apiFeatureInstance = new ApiFeatures(
      productModel.find(),
      req.query
    ).sort();
    const sortedProducts = await apiFeatureInstance.mongooseQuery;
    res.status(200).json({ message: "success", sortedProducts });
  }
};
