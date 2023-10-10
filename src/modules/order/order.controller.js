// ============================== create  product   ================================================

import { couponModel } from "../../../DB/Models/coupon.model.js";
import { orderModel } from "../../../DB/Models/order.model.js";
import { isCouponValid } from "../../util/helperFunctions/couponHelperFUnctions.js";
import { productModel } from "./../../../DB/Models/product.model.js";
import { json } from "stream/consumers";
import { cartModel } from "./../../../DB/Models/cart.models.js";
import { nanoid } from "nanoid";
import createInvoice from "./../../util/pdfkit.js";
import { sendEmailService } from "../../services/sendEmailService.js";

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    productId,
    quantity,
    address,
    phoneNumber,
    paymentMethod,
    couponCode,
  } = req.body;
  //================= coupon checks=================
  // Check if a coupon code is provided in the request.
  if (couponCode) {
    // Call the 'isCouponValid' function to check the validity of the coupon.
    const isCouponValidResult = await isCouponValid({
      couponCode,
      userId,
      next,
    });

    // If the result is not equal to true, it means there was an error, so return it.
    if (isCouponValidResult !== true) {
      return isCouponValidResult;
    }

    // If the coupon is valid, query the coupon model to retrieve additional coupon information.
    const coupon = await couponModel
      .findOne({ couponCode })
      .select("isPercentage isFixedAmount couponAmount couponAssignedToUsers");

    // Attach the retrieved coupon information to the request object for further use.
    req.coupon = coupon;
  }
  //================= product checks=================
  const products = [];
  // Initialize an empty array called "products" to store product objects.

  const isProductValid = await productModel.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });

  console.log(isProductValid);
  // Use the "productModel" to find a product with the given "productId" and
  // where the "stock" is greater than or equal to the specified "quantity."
  // Store the result in the "isProductValid" variable after awaiting the database query.

  if (!isProductValid) {
    return next(new Error("invalid product, please change ", { cause: 400 }));
  }
  // Check if "isProductValid" is falsy (null or undefined). If so, return an error
  // with the message "invalid product, please change" and a cause of 400 using the "next" function.

  const productObject = {
    productId,
    quantity,
    title: isProductValid.title,
    singleItemPrice: isProductValid.priceAfterDiscount,
    totalFinalPrice: isProductValid.priceAfterDiscount * quantity,
  };
  // Create an object "productObject" with details of the selected product, including
  // "productId," "quantity," "title," "singleItemPrice," and "totalFinalPrice."

  products.push(productObject);
  // Add the "productObject" to the "products" array.

  let subTotal = productObject.totalFinalPrice;
  let paidAmount = 0;
  // Initialize variables "subTotal" and "paidAmount."

  if (req.coupon?.isPercentage) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100);
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - (req.coupon.couponAmount || 0);
  } else {
    paidAmount = subTotal;
  }
  // Calculate the "paidAmount" based on whether the coupon is a percentage discount
  // or a fixed amount discount. If "isPercentage" is true, apply the percentage discount.
  // If "isFixedAmount" is true, subtract the fixed amount from the subtotal.

  let orderStatus;
  paymentMethod == "cash"
    ? (orderStatus = "placed")
    : (orderStatus = "pending");
  // Determine the "orderStatus" based on the "paymentMethod." If "paymentMethod" is "cash,"
  // set "orderStatus" to "placed"; otherwise, set it to "pending."

  const orderObject = {
    userId,
    products,
    address,
    phoneNumber,
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  };
  // Create an object "orderObject" representing an order, including user ID, products,
  // address, phone number, order status, payment method, subTotal, paidAmount, and coupon ID.

  const orderDB = await orderModel.create(orderObject);

  if (!orderDB) {
    return next(new Error("fail to create your order", { cause: 400 }));
  }
  // increase usageCount for coupon usage
  if (req.coupon) {
    for (const user of req.coupon.couponAssignedToUsers) {
      if (user.userId.toString() == userId.toString()) {
        user.usageCount += 1;
      }
    }
    await req.coupon.save();
  }

  // decrease product's stock by order's product quantity
  await productModel.findOneAndUpdate(
    { _id: productId },
    {
      $inc: { stock: -parseInt(quantity) },
    }
  );

  //create invoice
  const orderCode = `${req.authUser.userName}_${nanoid(3)}`;
  // generate invoice object
  const orderInvoice = {
    orderCode: orderCode,
    items: orderDB.products,
    subTotal: orderDB.subTotal,
    paidAmount: orderDB.paidAmount,
    date: orderDB.createdAt,
    shipping: {
      name: req.authUser.userName,
      address: orderDB.address,
      city: "cairo",
      state: "cairo",
      country: "egypt",
    },
  };

  // Create an invoice with the given orderInvoice data and save it as a PDF with the filename based on orderCode.
  createInvoice(orderInvoice, `${orderCode}.pdf`);

  // Send an email to the authenticated user with order confirmation details.
  await sendEmailService({
    // The recipient's email address is set to the email of the authenticated user.
    to: req.authUser.email,

    // The subject of the email is set to "Order Confirmation."
    subject: "Order Confirmation",

    // The email message is set as an HTML-formatted string.
    message: "<h1>Please find your invoice pdf<h1>",

    // Attachments are included in the email.
    attachments: [
      {
        // The path to the attached file (invoice PDF) is specified.
        path: `E:/Route/2-Backend/Assignments/ecom_proj/Files/${orderCode}.pdf`,
      },
    ],
  });

  //TODO: remove product from userCart if exist

  return res.status(201).json({ message: "Done", orderDB });
};

//================= convert cart to order =================

// Define an asynchronous function named "fromCartToOrder" with three parameters: req, res, and next.
export const fromCartToOrder = async (req, res, next) => {
  // Extract the user ID from the request's authenticated user object.
  const userId = req.authUser._id;

  // Extract the "cartId" from the request's query parameters.
  const { cartId } = req.query;

  // Extract various information (address, phoneNumber, paymentMethod, couponCode) from the request's body.
  const { address, phoneNumber, paymentMethod, couponCode } = req.body;

  // Find the current cart in the database using the extracted "cartId."
  const currentCart = await cartModel.findById(cartId);

  // Check if the currentCart is null (not found). If so, return an error response and pass it to the "next" middleware.
  if (!currentCart) {
    return next(new Error("please fill cart first ", { cause: 400 }));
  }

  // Initialize variables for "subTotal" and "paidAmount" based on the currentCart's subTotal.
  let subTotal = currentCart.subTotal;
  let paidAmount = 0;

  // Check if a coupon is applied. Calculate "paidAmount" based on the coupon type (percentage or fixed amount).
  if (req.coupon?.isPercentage) {
    paidAmount = subTotal * (1 - (req.coupon.couponAmount || 0) / 100);
  } else if (req.coupon?.isFixedAmount) {
    paidAmount = subTotal - (req.coupon.couponAmount || 0);
  } else {
    paidAmount = subTotal;
  }

  // Initialize the "orderStatus" based on the selected payment method.
  let orderStatus;
  paymentMethod == "cash"
    ? (orderStatus = "placed")
    : (orderStatus = "pending");

  // Initialize an empty array to store order products.
  let orderProduct = [];

  // Iterate through products in the cart and fetch product details from the database.
  for (const product of cart.products) {
    const productExist = await productModel.findById(product.productId);
    orderProduct.push({
      productId: product.productId,
      quantity: product.quantity,
      title: productExist.title,
      price: productExist.priceAfterDiscount,
      finalPrice: productExist.priceAfterDiscount * product.quantity,
    });
  }

  // Create an object representing the order with all the required information.
  const orderObject = {
    userId,
    products: orderProduct,
    address,
    phoneNumbers, // Note: It should be "phoneNumber" instead of "phoneNumbers" based on the previous destructuring.
    orderStatus,
    paymentMethod,
    subTotal,
    paidAmount,
    couponId: req.coupon?._id,
  };

  // Create a new order in the database using the orderObject.
  const orderDB = await orderModel.create(orderObject);

  // If the order is successfully created:
  if (orderDB) {
    // Increase the usageCount for the applied coupon (if any) and save it.
    if (req.coupon) {
      for (const user of req.coupon.couponAssginedToUsers) {
        if (user.userId.toString() == userId.toString()) {
          user.usageCount += 1;
        }
      }
      await req.coupon.save();
    }

    // Decrease the stock of products in the cart from the database.
    for (const product of cart.products) {
      await productModel.findOneAndUpdate(
        { _id: product.productId },
        {
          $inc: { stock: -parseInt(product.quantity) },
        }
      );
    }

    // TODO: Remove products from the user's cart if they exist.
    cart.products = [];
    await cart.save();

    // Return a success response with status 201 and relevant data (orderDB and cart).
    return res.status(201).json({ message: "Done", orderDB, cart });
  }

  // If there is an issue creating the order, return an error response and pass it to the "next" middleware.
  return next(new Error("fail to create your order", { cause: 400 }));
};
