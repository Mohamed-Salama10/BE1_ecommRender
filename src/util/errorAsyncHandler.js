import express from "express";
import cloudinary from "./cloudinary.config.js";

// This is defining an exportable asynchronous handler function called 'asyncHandler'
export const asyncHandler = (API) => {
  // This function takes a callback function 'API' as an argument and returns another function
  return (req, res, next) => {
    // This returned function takes three arguments: 'req' (request), 'res' (response), and 'next' (next middleware function)

    // The 'API' function is invoked with 'req', 'res', and 'next' as arguments, and any errors it throws are caught in the following async block
    API(req, res, next).catch(async (err) => {
      // If there's an error, it's logged to the console
      console.error(err);

      // Check if there's a property called 'imagePath' in the 'req' object
      if (req.imagePath) {
        // If 'imagePath' exists, this code will run

        // Delete resources with a prefix matching 'req.imagePath' using the Cloudinary API
        await cloudinary.api.delete_resources_by_prefix(req.imagePath);

        // Delete the folder specified by 'req.imagePath' using the Cloudinary API
        await cloudinary.api.delete_folder(req.imagePath);
      }

      // Set the HTTP response status code to 500 (Internal Server Error) and send a JSON response with a message "Fail"
      res.status(500).json({ message: "Fail" });
    });
  };
};

/**
 * globalResponse is a middleware function used to handle and respond to errors globally in an Express.js application. It takes four parameters: 'err', 'req' (request), 'res' (response), and 'next' (next middleware function). When an error occurs, it examines the error object and the presence of 'req.validationErrorArr' to determine the appropriate HTTP response status code and message. If 'req.validationErrorArr' exists, it responds with a status code derived from 'err['cause']' or 400 (Bad Request) and sends a JSON response with the validation error message. If 'req.validationErrorArr' does not exist, it responds with a status code derived from 'err['cause']' or 500 (Internal Server Error) and sends a JSON response with the error message from 'err.message'.
 */

// This is defining an exportable function called 'globalResponse' that takes four parameters: 'err', 'req' (request), 'res' (response), and 'next' (next middleware function)
export const globalResponse = (err, req, res, next) => {
  // Check if 'err' exists (i.e., if there's an error)
  if (err) {
    // Check if 'req.validationErrorArr' exists
    if (req.validationErrorArr) {
      // If 'req.validationErrorArr' exists, set the HTTP response status code to either 'err['cause']' or 400 (Bad Request), and send a JSON response with the message from 'req.validationErrorArr'
      return res
        .status(err['cause'] || 400)
        .json({ message: req.validationErrorArr });
    }
    // If 'req.validationErrorArr' does not exist, set the HTTP response status code to either 'err['cause']' or 500 (Internal Server Error), and send a JSON response with the message from 'err.message'
    return res.status(err['cause'] || 500).json({ message: err.message });
  }
};

