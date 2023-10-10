import { productModel } from "../../../DB/Models/product.model.js";
import { cartModel } from "./../../../DB/Models/cart.models.js";
import { json } from "stream/consumers";

// ============================== addToCart   ================================================
export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id; // Extract the user ID from the request object
  const { productId, quantity } = req.body; // Extract product ID and quantity from the request body

  const currentProduct = await productModel.findOne({
    // Find a product in the database that matches the given ID and has enough stock
    _id: productId,
    stock: { $gte: quantity },
  });

  if (!currentProduct) {
    // If no matching product is found, return an error with a status code 400
    return next(
      new Error("invalid please check the avilable quantitiy", { cause: 400 })
    );
  }

  const userCart = await cartModel.findOne({ userId }).lean(); // Check if the user already has a cart model

  if (userCart) {
    // If a cart exists for the user, continue processing
    let productExist = false;

    for (const product of userCart.products) {
      // Loop through user's cart products
      if (productId == product.productId) {
        // Check if the product is already in the cart
        product.quantity = quantity; // Update the quantity if the product exists
        productExist = true;
      }
    }

    if (productExist == false) {
      // If the product is not in the cart, add it
      userCart.products.push({ productId, quantity });
    }

    let subTotal = 0;

    for (const product of userCart.products) {
      // Calculate the subtotal for the cart
      const productExists = await productModel.findById(product.productId);
      subTotal += productExists.priceAfterDiscount * product.quantity || 0;
    }

    const newCart = await cartModel.findOneAndUpdate(
      // Update the user's cart in the database
      { userId },
      {
        products: userCart.products,
      },
      { new: true }
    );

    res.status(200).json({ message: "done", newCart }); // Respond with updated cart
  }

  // If the user doesn't have an existing cart, create a new one
  const subTotal = currentProduct.priceAfterDiscount * quantity; // Calculate the subtotal for the current product and quantity

  const cartObject = {
    // Create a cart object with user ID and product details
    userId,
    products: [
      {
        productId,
        quantity,
      },
    ],
    subTotal,
  };

  const cartDb = await cartModel.create(cartObject); // Create a new cart in the database

  res.status(201).json({ message: "done", cartDb }); // Respond with a status code 201 and the created cart
};

// ============================== removeFromCart   ================================================
export const deleteFromCart = async (req, res, next) => {
  const userId = req.authUser._id; // Extract the user ID from the request object
  const { productId } = req.body; // Extract the product ID from the request body

  const currentProduct = await productModel.findOne({
    _id: productId, // Find a product in the database that matches the given ID
  });

  if (!currentProduct) {
    // If no matching product is found, return an error with a status code 400
    return next(
      new Error("invalid please check the product does not exist", {
        cause: 400,
      })
    );
  }

  const userCart = await cartModel.findOne({
    userId,
    "products.productId": productId, // Find the user's cart containing the specified product
  });

  // Loop through the user's cart products to find and remove the specified product
  userCart.products.forEach((ele) => {
    if (ele.productId == productId) {
      userCart.products.splice(userCart.products.indexOf(ele), 1);
    }
  });

  await userCart.save(); // Save the updated user's cart in the database
  res.status(200).message({ message: "done", userCart }); // Respond with a status code 200 and a message
};
