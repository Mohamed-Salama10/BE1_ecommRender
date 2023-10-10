// Import necessary modules from the "mongoose" package
import { Schema, Types, model } from "mongoose";

// Define a new Mongoose schema for an "order"
export const orderSchema = new Schema(
  {
    // User ID associated with the order
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the "User" model
      required: true, // User ID is required
    },
    // List of products in the order
    products: [
      {
        // Product ID associated with this product in the order
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product", // Reference to the "Product" model
          required: true, // Product ID is required
        },
        // Quantity of the product in the order
        quantity: {
          type: Number,
          default: 1, // Default quantity is 1
          required: true, // Quantity is required
        },
        // Title of the product
        title: {
          type: String,
          required: true, // Title is required
        },
        // Price of a single item of the product
        singleItemPrice: {
          type: Number,
          required: true, // Single item price is required
        },
        // Total price for all items of this product in the order
        totalFinalPrice: {
          type: Number,
          required: true, // Total final price is required
        },
      },
    ],
    // Subtotal of the order
    subTotal: {
      type: Number,
      required: true, // Subtotal is required
    },
    // Coupon ID associated with the order (optional)
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon", // Reference to the "Coupon" model
    },
    // Count of how many times the coupon has been used (default is 0)
    couponUsageCount: {
      type: Number,
      default: 0,
    },
    // Total amount paid for the order (default is 0)
    paidAmount: {
      type: Number,
      default: 0,
      required: true, // Paid amount is required
    },
    // Shipping address for the order
    address: {
      type: String,
      required: true, // Address is required
    },
    // Phone numbers associated with the order (an array)
    phoneNumber: [
      {
        type: String,
        required: true, // At least one phone number is required
      },
    ],
    // Status of the order (enum with specific values)
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "placed",
        "preparation",
        "on way",
        "delivered",
        "cancelled",
      ],
    },
    // Payment method used for the order (enum with specific values)
    paymentMethod: {
      type: String,
      required: true, // Payment method is required
      enum: ["cash", "card"],
    },
    // User who last updated the order (optional)
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the "User" model
    },
    // User who cancelled the order (optional)
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the "User" model
    },
    // Reason for cancelling the order (optional)
    reasonOfCancel: {
      type: String,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt timestamps
);

// Create a Mongoose model for the "Order" using the defined schema
export const orderModel = model("Order", orderSchema);
 