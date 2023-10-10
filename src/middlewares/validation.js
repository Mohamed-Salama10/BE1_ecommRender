// req => userdata
// schema => endPoint schema

import { Types } from "mongoose";
import joi from "joi";

const reqMethods = ["body", "query", "params", "headers", "file", "files"];

const validationObjectId = (value, helper) => {
  // this function is used to validate the object id based on the mongoose criteria
  //Types.ObjectId.isValid() given a value validate it and return boolean true or false
  return Types.ObjectId.isValid(value) ? true : helper.message("invalid id");
};

export const generalFields = {
  email: joi
    .string()
    .email({ tlds: { allow: ["com", "net", "org"] } })
    .required(),
  password: joi
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
    .messages({
      "string.pattern.base": "Password regex fail",
    })
    .required(),
  //create a custom rule validation for object id
  _id: joi.string().custom(validationObjectId),
};

export const validationCoreFunction = (schema) => {
  return (req, res, next) => {
    // req
    const validationErrorArr = [];
    for (const key of reqMethods) {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        }); // error
        if (validationResult.error) {
          validationErrorArr.push(validationResult.error.details);
        }
      }
    }

    if (validationErrorArr.length) {
      return res
        .status(400)
        .json({ message: "Validation Error", Errors: validationErrorArr });
    }
    next();
  };
};
