
import mongoose from "mongoose";

export const dbConnection = async () => {
  const connectionLink = process.env.CONNECTION_DB_CLOUD
  console.log(connectionLink);
  return await mongoose
    .connect(connectionLink)
    .then((res) => console.log("Connected to MongoDB..."))
    .catch((err) => {
      console.log(err);
      console.error("Could not connect to MongoDB...")
    });
};
