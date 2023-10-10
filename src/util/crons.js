/**
 * it is a function that will change the status of all expired coupons
 * it uses node schedule  to do this
 * npm i node-schedule
 * for date and time use module moment.js npm i moment
 */

import { scheduleJob } from "node-schedule";
import { couponModel } from "../../DB/Models/coupon.model.js";
import moment from "moment/moment.js";
export const changeCouponsStatusCorn = () => {
  // ┌───────────── Minute (0 - 59)
// │ ┌───────────── Hour (0 - 23)
// │ │ ┌───────────── Day of the Month (1 - 31)
// │ │ │ ┌───────────── Month (1 - 12 or Jan - Dec)
// │ │ │ │ ┌───────────── Day of the Week (0 - 7 or Sun - Sat, where both 0 and 7 represent Sunday)
// │ │ │ │ │ ┌───────────── Year (optional, 1970 - 2099)
// │ │ │ │ │ │
// * * * * * *

  scheduleJob("* 1 1 * * *", async function () {
    /**
     * corn operation runs every specific time depending on the value inputted in ******
     * The function loops over the coupon model in the db, gets the coupons that are expired and change the status to expired
     */
    const validCoupons = await couponModel.find({ couponStatus: "valid" });
    
    for (const coupon of validCoupons) {
      // checks if the coupon.todate is before today date
      if (moment(coupon.toDate).isBefore(moment())) {
        // change the current coupon status
        coupon.couponStatus = "expired";
        //save the changes to coupon mode
        await coupon.save();
      }
    }

    console.log("cron changeCouponsStatusCorn() is running........ ");
  });
};
