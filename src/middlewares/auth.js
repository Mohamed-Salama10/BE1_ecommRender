/**
 * Middleware: isAuth
 *
 * This middleware function serves as an authentication and authorization mechanism for incoming HTTP requests.
 * It performs token verification, checks for valid prefixes, handles token expiration and refreshing,
 * and attaches user information to the request object when a valid token is present.
 * If any errors occur during this process, it calls the 'next' function with an error for further handling.
 */

// Import necessary functions and modules from other files
import { log } from "console";
import { generateToken, verifyToken } from "../util/tokenFunctions.js";
import { userModel } from "./../../DB/Models/user.model.js";
import jwt from "jsonwebtoken";
// Define a middleware function called 'isAuth'
// This is a function named isAuth that takes a 'roles' parameter
export const isAuth = (roles) => {
  // This is an asynchronous middleware function that takes 'req', 'res', and 'next' as parameters
  return async (req, res, next) => {
    try {
      // Extract the 'authorization' header from the request
      const { authorization } = req.headers;
      
      // Check if 'authorization' header is missing, and if so, return an error
      if (!authorization) {
        return next(new Error("Please login first", { cause: 400 }));
      }
      // Check if the 'authorization' header does not start with "ecomm__", and if so, return an error
      if (!authorization.startsWith("ecomm__")) {
        return next(new Error("invalid token prefix", { cause: 400 }));
      }
      
      // Split the 'authorization' header to extract the token
      const splitedToken = authorization.split(" ")[1];
      
      try {
        // Verify the token using a function named 'verifyToken' with the provided data
        const decodedData = verifyToken({
          token: splitedToken,
          signature: process.env.SIGN_IN_TOKEN_SECRET,
        });

        // Find a user in the database by their '_id' and retrieve their 'email', 'userName', and 'role'
        const findUser = await userModel.findById(
          decodedData._id,
          "email userName role"
        );
        
        // If the user is not found, return an error
        if (!findUser) {
          return next(new Error("Please SignUp", { cause: 400 }));
        }

        // Log the 'roles' and the 'role' of the user


        // Check if the user's 'role' is not included in the provided 'roles' array, and if so, return an error
        if (!roles.includes(findUser.role)) {
          return next(new Error("Unauthorized user", { cause: 401 }));
        }

        // Set the 'authUser' property in the request object to the found user
        req.authUser = findUser;
        next(); // Continue to the next middleware
      } catch (error) {
        // Handle errors related to token verification, expiration, and refresh
        if (error == "TokenExpiredError: jwt expired") {
          // Refresh the token for the user
          const user = await userModel.findOne({ token: splitedToken });
          if (!user) {
            return next(new Error("Wrong token", { cause: 400 }));
          }

          // Generate a new token for the user
          const userToken = generateToken({
            payload: {
              email: user.email,
              _id: user._id,
            },
            signature: process.env.SIGN_IN_TOKEN_SECRET,
            expiresIn: "1000000h",
          });

          // If token generation fails, return an error
          if (!userToken) {
            return next(
              new Error("token generation fail, payload canot be empty", {
                cause: 400,
              })
            );
          }

          // Update the user's token in the database
          await userModel.findOneAndUpdate(
            { token: splitedToken },
            { token: userToken }
          );
          
          // Return a response with the refreshed token
          return res
            .status(200)
            .json({ message: "Token refreshed", userToken });
        }

        // Handle other token-related errors
        return next(new Error("invalid token", { cause: 500 }));
      }
    } catch (error) {
      // Handle other errors that may occur within this middleware
      next(new Error("catch error in auth", { cause: 500 }));
    }
  };
};
