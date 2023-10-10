import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { systemRoles } from "../../src/util/systemRoles.js";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    isConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      default: systemRoles.user,
      enum: [systemRoles.user, systemRoles.admin, systemRoles.superAdmin],
    },
    //phone number is better saved as string for the country codes and + that exist
    phoneNumber: {
      type: String,
      required: true,
    },
    address: [
      {
        type: String,
        required: true,
      },
    ],
    profilePicture: {
      secure_url: String,
      public_id: String,
    },
    status: {
      type: String,
      default: "offline",
      enum: ["online", "offline"],
    },
    gender: {
      type: String,
      default: "not specified",
      enum: ["not specified", "male", "female"],
    },
    age: Number,
    token: String,
    forgetCode: String,
  },
  { timestamps: true }
);
// a hook that will hash the password before saving it to the db
// note: any save on the schema like updating and save it will hash the password every time

userSchema.pre("save", function (next, hash) {
  this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS);
  next();
});
export const userModel = model("User", userSchema);
