import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  //Category schema contains Name, slug, Image, createdby
  {
    name: {
      type: String,
      lowercase: true,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    Image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "subCategory",
      required: true,
    },
  },
  { timestamps: true }
);






export const brandModel = model("Brands", brandSchema);
