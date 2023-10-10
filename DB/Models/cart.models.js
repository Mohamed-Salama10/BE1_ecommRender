// Import the 'Schema' class from the 'mongoose' library.
import { Schema, model } from "mongoose";

// Create a new instance of a Mongoose schema called 'cartSchema'.
const cartSchema = new Schema(
  {
    // Define a field 'userId' in the schema.
    userId: {
      required: true, // It is required (mandatory) for each document.
      type: Schema.Types.ObjectId, // Its type is an ObjectId, typically used for references.
      ref: "User", // It references the "User" model.
    },
    // Define an array field 'products' in the schema.
    products: [
      {
        // Each element in the 'products' array has a 'productId' field.
        productId: {
          type: Schema.Types.ObjectId, // Its type is an ObjectId.
          ref: "Product", // It references the "Product" model.
          required: true, // It is required (mandatory) for each element.
        },
        // Each element in the 'products' array has a 'quantity' field.
        quantity: {
          type: Number, // Its type is a Number.
          required: true, // It is required (mandatory) for each element.
        },
      },
    ],
    // Each element in the 'products' array has a 'subTotal' field.
        subTotal: {
            type: Number, // Its type is a Number.
            required: true, // It is required (mandatory) for each element.
        },
  },
  { timestamps: true } // Include automatic timestamps for document creation and updates.
);

// Export the Mongoose model named 'cartModel' associated with the 'cartSchema'.
export const cartModel = model("Cart", cartSchema);
