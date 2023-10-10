import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  //Category schema contains Name, slug, Image, createdby
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    couponAmount: {
      type: Number,
      required: true,

      min: 1,
      default: 1,
      max: 100,
    },

    isPercentage: {
      type: Boolean,
      required: true,
      default: false,
    },
    isFixedAmount: {
      type: Boolean,
      required: true,
      default: false,
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

    couponAssignedToUsers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        MaxUsage: {
          type: Number,
          required: true,
          default: 1,
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    couponStatus: {
      type: String,
      required: true,
      enum: ["Expired", "expired", "Valid", "valid"],
      default: "valid",
    },
  },
  {
    toObject: { virtuals: true }, // to allow virtuals to be converted to object so it can be seen in the log not in the response
    toJSON: { virtuals: true }, // to allow virtual to be sent in the response
    timestamps: true,
  }
);

export const couponModel = model("Coupon", couponSchema);
