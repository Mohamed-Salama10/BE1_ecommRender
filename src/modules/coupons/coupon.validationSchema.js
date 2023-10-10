// Import the Joi library for data validation.
import Joi from "joi";

// Import the generalFields object from the validation.js file located two levels above this file.
import { generalFields } from "../../middlewares/validation.js";

// Define a schema for adding a coupon.
export const addCouponSchema = {
  // Define the 'body' property for validating the request body.
  body: Joi.object({
    // Validate 'couponCode' as a string with a minimum length of 5, maximum length of 55, and it's required.
    couponCode: Joi.string().min(5).max(55).required(),

    // Validate 'couponAmount' as a positive number with a minimum value of 1, maximum value of 100, and it's required.
    couponAmount: Joi.number().positive().min(1).max(100).required(),

    // Validate 'fromDate' as a date that is greater than the current date (Date.now()), and it's required.
    fromDate: Joi.date().greater(Date.now()).required(),

    // Validate 'toDate' as a date that is greater than 'fromDate', and it's required.
    toDate: Joi.date().greater(Joi.ref("fromDate")).required(),

    // 'isPercentage' and 'isFixedAmount' are optional boolean properties.

    isPercentage: Joi.boolean().optional(),
    isFixedAmount: Joi.boolean().optional(),

    // Validate 'couponAssginedToUsers' as an array with required items.
    couponAssignedToUsers: Joi.array().items().required(),

    // Validate 'headers' as an object with a 'test' property that is a required string.
    headers: Joi.object({
      test: Joi.string().required(),
    }).options({ allowUnknown: true }), // Allow unknown properties in the 'headers' object.
  }),
};

// Define a schema for deleting a coupon.
export const deleteCouponSchema = {
  // Define the 'query' property for validating the query parameters.
  query: Joi.object({
    // Validate '_id' using the '_id' validation rule from the 'generalFields' object, and it's required.
    _id: generalFields._id.required(),
  }).required(),
};
