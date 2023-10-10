import slugify from "slugify";
import { brandModel } from "../../../DB/Models/brands.model.js";
import { categoryModel } from "../../../DB/Models/category.models.js";
import { subCategoryModel } from "../../../DB/Models/subcategory.models.js";
import cloudinary from "../../util/cloudinary.config.js";
import { nanoid } from "nanoid";
import { couponModel } from "../../../DB/Models/coupon.model.js";
import { isCouponExist } from "../../util/helperFunctions/couponHelperFUnctions.js";
import { error } from "console";
import { productModel } from "../../../DB/Models/product.model.js";
import { userModel } from "../../../DB/Models/user.model.js";
import mongoose from "mongoose";


const { ObjectId } = mongoose.Types;

// ============================== create coupon   ================================================

export const createCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isPercentage,
    isFixedAmount,
    couponAssignedToUsers,
  } = req.body;

  // check if coupon is duplicate
  const isCouponDuplicated = await couponModel.findOne({
    couponCode: couponCode,
  });

  if (isCouponDuplicated) {
    return next(new Error("coupon already exist", { cause: 400 }));
  }
  // handle  case if user sent both percentage and fixedAmount or didnot send either
  if ((!isPercentage && !isFixedAmount) || (isFixedAmount && isPercentage)) {
    return next(
      new Error("select if the coupon is percentage or fixed amount ", {
        cause: 400,
      })
    );
  }
  

  //======================== assign to users ==================
  // Initialize an empty array to store user IDs.
  let usersIds = [];

  // Loop through each user in the 'couponAssignedToUsers' array.
  for (const user of couponAssignedToUsers) {
    // Push the 'userId' property of each user into the 'usersIds' array.
    usersIds.push(user.userId)
  
    
  }

  // Use the 'userModel' to find users whose '_id' matches any of the 'usersIds'.
  const usersCheck = await userModel.find({
    _id: {
      $in: usersIds,
    },
  });


  // Check if the number of 'usersIds' does not match the number of users found.
  if (usersIds.length !== usersCheck.length) {
    // If they don't match, return an error with status code 400.
    return next(new Error("invalid userIds", { cause: 400 }));
  }

  // Create a 'couponObject' with various properties.
  const couponObject = {
    couponCode,
    couponAmount,
    isPercentage,
    isFixedAmount,
    fromDate,
    toDate,
    couponAssignedToUsers,
    createdBy: req.authUser._id,
  };

  // Use the 'couponModel' to create a new coupon in the database using 'couponObject'.
  const couponDb = await couponModel.create(couponObject);

  // Check if the coupon creation was successful.
  if (!couponDb) {
    // If not, return an error with status code 400.
    return next(new Error("fail to add coupon", { cause: 400 }));
  }

  // Respond with a status of 201 (Created) and a JSON response containing a message and the created coupon.
  res.status(201).json({ message: "done", couponDb });
};
// ============================== updateCoupon   ================================================
// Define an asynchronous function named 'updateCoupon' which takes 'req', 'res', and 'next' as parameters.
export const updateCoupon = async (req, res, next) => {
  // Destructure the 'couponId' from the query parameters of the request.
  const { couponId } = req.query;

  // Get the user's ID from the 'authUser' property in the request object.
  const user_id = req.authUser._id;

  // Destructure various properties from the request body.
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isPercentage,
    isFixedAmount,
    couponAssignedToUsers,
  } = req.body;

  // Check if a coupon with the provided 'couponId' exists by calling the 'isCouponExist' function.
  const isCoupon = isCouponExist(couponId);

  // If the 'isCoupon' variable is false (coupon doesn't exist), return an error response with a 400 status code.
  if (isCoupon == false) {
    return next(new Error("coupon doesn't exist", { cause: 400 }));
  }

  // Attempt to find the current coupon based on '_id' and 'createdBy' (user_id).
  const currentCoupon = await couponModel.find({
    _id: couponId,
    createdBy: user_id,
  });

  // Check if no currentCoupon is found, and if so, return an error response with a 400 status code.
  if (!currentCoupon) {
    return next(new Error("invalid credentials ", { cause: 400 }));
  }

  // Update various coupon properties with values from the request body, if they exist.
  currentCoupon.couponCode = couponCode ? couponCode : currentCoupon.couponCode;
  currentCoupon.couponAmount = couponAmount
    ? couponAmount
    : currentCoupon.couponAmount;
  currentCoupon.fromDate = fromDate ? fromDate : currentCoupon.fromDate;
  currentCoupon.toDate = toDate ? toDate : currentCoupon.toDate;

  // Check if both 'isFixedAmount' and 'isPercentage' are true, which is not allowed.
  if (isFixedAmount && isPercentage) {
    return next(
      new Error(
        "coupon cannot be fixed amount and percentage at the same time",
        {
          cause: 400,
        }
      )
    );
  }

  // Update 'isPercentage' and 'isFixedAmount' properties with values from the request body, if they exist.
  currentCoupon.isPercentage = isPercentage
    ? isPercentage
    : currentCoupon.isPercentage;

  currentCoupon.isFixedAmount = isFixedAmount
    ? isFixedAmount
    : currentCoupon.isFixedAmount;

  // If 'couponAssignedToUsers' exists in the request body, process it.
  if (couponAssignedToUsers) {
    let usersIds = [];

    // Loop through each user object in the 'couponAssignedToUsers' array.
    for (const user of couponAssignedToUsers) {
      // Push the 'userId' property of each user into the 'usersIds' array.
      usersIds.push(user.userId);
    }

    // Use the 'userModel' to find users whose '_id' matches any of the 'usersIds'.
    const usersCheck = await userModel.find({
      _id: {
        $in: usersIds,
      },
    });

    // Check if the number of 'usersIds' does not match the number of users found.
    if (usersIds.length !== usersCheck.length) {
      // If they don't match, return an error response with a 400 status code.
      return next(new Error("invalid userIds", { cause: 400 }));
    }

    // Update 'couponAssignedToUsers' property with values from the request body, if it exists.
    currentCoupon.couponAssignedToUsers = couponAssignedToUsers
      ? couponAssignedToUsers
      : currentCoupon.couponAssignedToUsers;
  }
};

// ============================== deleteCoupon   ================================================
// Define an asynchronous function named 'deleteCoupon' which takes 'req', 'res', and 'next' as parameters.
export const deleteCoupon = async (req, res, next) => {
  // Destructure the '_id' property from the request body.
  const { _id } = req.body;

  // Retrieve the user's ID from the 'authUser' property in the request object.
  const userId = req.authUser._id;

  // Check if a coupon with the provided '_id' exists by calling the 'isCouponExist' function asynchronously.
  if (await isCouponExist(_id)) {
    // If the coupon exists, return an error response with a 400 status code and a message.
    return next(new Error("coupon does not exist ", { cause: 400 }));
  }

  // Attempt to find and delete a coupon from the database where '_id' matches and 'createdBy' is the user's ID.
  const currentCoupon = await couponModel.findOneAndDelete({
    _id,
    createdBy: userId,
  });

  // Check if a coupon was found and deleted.
  if (!currentCoupon) {
    // If no coupon was found and deleted, return an error response with a 400 status code and a message.
    return next(new Error("error, try again later ", { cause: 400 }));
  }

  // If the coupon was successfully deleted, send a JSON response with a 200 status code and a success message.
  res.status(200).json({ message: "coupon deleted successfully" });
};
