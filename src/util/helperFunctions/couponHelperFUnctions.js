// Import the 'couponModel' from a specific file path.
import { couponModel } from "../../../DB/Models/coupon.model.js";

// Import the 'moment' library from a specific file path.

import moment from 'moment-timezone'
// ============================== check if coupon exist  ================================================
export const isCouponExist = async (couPonId) => {
  // Use the 'findById' method of 'couponModel' to check if a coupon with the given ID exists.
  isCoupon = await couponModel.findById(couPonId);
  if (isCoupon) {
    return true; // Return true if the coupon exists.
  } else {
    return false; // Return false if the coupon does not exist.
  }
};
// ============================== check if coupon valid   ================================================

export const isCouponValid = async ({ couponCode, userId, next } = {}) => {
  // Use the "couponModel" to find a coupon document with the given "couponCode"
  const coupon = await couponModel.findOne({ couponCode })

  // If no coupon is found with the provided code, return an error using the "next" function
  if (!coupon) {
    return next(new Error('please enter a valid coupon code'))
  }

  // Check if the coupon has expired or if its end date is before the current time in the 'Africa/Cairo' timezone
  if (
    coupon.couponStatus == 'Expired' ||
    moment(coupon.toDate).isBefore(moment().tz('Africa/Cairo'))
  ) {
    // If the coupon is expired, return an error with a status code of 400
    return next(new Error('coupon is expired', { cause: 400 }))
  }

  // Loop through the list of users the coupon is assigned to
  for (const user of coupon.couponAssignedToUsers) {
    // Check if the provided "userId" does not match the "userId" assigned to the current user
    if (userId.toString() !== user.userId.toString()) {
      // If not assigned to the user, return an error with a status code of 400
      return next(
        new Error('this user not assigned for this coupon', { cause: 400 }),
      )
    }
    // Check if the user has exceeded the maximum usage count for this coupon
    if (user.maxUsage <= user.usageCount) {
      // If exceeded, return an error with a status code of 400
      return next(
        new Error('exceed the max usage for this coupon', { cause: 400 }),
      )
    }
  }

  // If all checks pass, return "true" indicating that the coupon is valid
  return true
}
