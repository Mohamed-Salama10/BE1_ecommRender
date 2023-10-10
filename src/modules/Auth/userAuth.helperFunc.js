import { userModel } from "../../../DB/Models/user.model.js";

// create a helper function if email exist
export async function isEmailExist(email) {
  const isEmail = await userModel.findOne({ email });
  if (isEmail) return true;
  else return false;
}
// create a helper function check if phone exist
export async function isPhonenumberExist(phone) {
  const isPhone = await userModel.findOne({ phone });
  if (isPhone) return true;
  else return false;
}
