import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      lowercase: true,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      lowercase: true,
      required: true,
    },
    colors: [String],
    size: [String],
    price: {
      type: Number,
      required: true,
      default: 1,
    },
    appliedDiscount: {
      type: Number,
      default: 0,
    },
    priceAfterDiscount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      
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
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brands",
      required: true,
    },

    images: [
      {
        secure_url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    customId: String,
  },

  { timestamps: true }
);

export const productModel = model("Product", productSchema);
