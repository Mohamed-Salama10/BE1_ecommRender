import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  //Category schema contains Name, slug, Image, createdby
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
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
    },
    customId: { type: String },
  },
  {
    toObject: { virtuals: true }, // to allow virtuals to be converted to object so it can be seen in the log not in the response
    toJSON: { virtuals: true }, // to allow virtual to be sent in the response
    timestamps: true,
  }
);

//==============================Define the subcategory virtual ======================

categorySchema.virtual("subCategory", {
  // subCategory represent the name of the field that in the returned object that will contain the data

  ref: "subCategory", // name of the collection you want to connect  as named in its model not in db in this case subCategory
  foreignField: "categoryId", // name of the field in subcategories that connects to the category collection
  localField: "_id", // the field in the category collection that represent the foreign field in the subCategory
});













//==============================export category model  ==============================
export const categoryModel = model("Category", categorySchema);
