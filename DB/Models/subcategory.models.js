import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
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
    customId: String,
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

subCategorySchema.virtual("brand", {
  // Brands represent the name of the field that in the returned object that will contain the data

  ref: "Brands", // name of the collection you want to connect  as named in its model not in db in this case Brands
  foreignField: "subCategoryId", // name of the field in brands that connects to the category collection in this case subCategoryId
  localField: "_id", // the field in the subCategory collection that represent the foreign field in the brand
});

export const subCategoryModel = model("subCategory", subCategorySchema);
