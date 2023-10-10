import mongoose from "mongoose";

export const dbConnection = async () => {
  return await mongoose
    .connect("mongodb://127.0.0.1:27017/ecomdb")
    .then((res) => console.log("Connected to MongoDB..."))
    .catch((err) => console.error("Could not connect to MongoDB..."));
};
