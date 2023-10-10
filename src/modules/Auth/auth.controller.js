import { userModel } from "../../../DB/Models/user.model.js";
import { sendEmailService } from "../../services/sendEmailService.js";

import { generateToken, verifyToken } from "../../util/tokenFunctions.js";
import { isEmailExist } from "./userAuth.helperFunc.js";
import { log } from "console";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { send } from "process";
import { emailTemplate } from "./../../util/emailTTemplate.js";
// ============================== signUp   ================================================
export const signUp = async (req, res, next) => {
  const { userName, email, phoneNumber, password, address, age,role } = req.body;
  //check if email exist
  const doEmailExist = await isEmailExist(email);

  if (doEmailExist == true) {
    return next(new Error("email already exist", { cause: 400 }));
  }

  //generate token
  const token = generateToken({
    payload: {
      email,
    },
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
    expiresIn: "1y",
  });
  //  send userConfirmation link

  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirm/${token}`;
  const isEmail = sendEmailService({
    to: email,
    subject: "Confirmation Email",
    message: emailTemplate({
      link: confirmationLink,
      linkData: "Click here to confirm",
      subject: "Confirmation Email",
    }),
  });
  if (!isEmail) {
    return next(new Error("fail to send email", { cause: 400 }));
  }

  const user = new userModel({
    userName,
    email,
    phoneNumber,
    password,
    address,
    age,
    role
  });

  const savedUser = await user.save();
  res.status(200).json({ message: "success", savedUser });
};

// ============================== confirm email    ================================================
export const confirmEmail = async (req, res, next) => {
  // get token from the params
  const { token } = req.params;
  console.log(token);
  // decode the token into object  using the signature it was created with
  const decode = verifyToken({
    token,
    signature: process.env.CONFIRMATION_EMAIL_TOKEN,
  });
  // update is confirmed in db
  const user = await userModel.findOneAndUpdate(
    { email: decode?.email, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );
  if (!user) {
    return next(new Error("already confirmed ", { cause: 400 }));
  }
  res.status(200).json({ message: "confirm success " });
};

// ============================== signIn   ================================================
export const signIn = async (req, res, next) => {
  // get password and email form body
  const { email, password } = req.body;
  // get current user
  const user = await userModel.findOne({ email });
  // if user doesnot exist return error
  if (!user) {
    return next(new Error("invalid login credentials", { cause: 400 }));
  }

  // check if password match
  const isPassword = bcrypt.compareSync(password, user.password);
  if (!isPassword) {
    return next(new Error("invalid login credentials", { cause: 400 }));
  }
  // generate token for the user

  const token = generateToken({
    payload: {
      email,
      _id: user._id,
      role: user.role,
    },
    signature: process.env.SIGN_IN_TOKEN_SECRET,
  });
  // find and update user by the email value, update the token field and status field
  const userUpdate = await userModel.findOneAndUpdate(
    { email },
    {
      token: token,
      status: "online",
    },
    //new: true =>  means the returned value will be the updated value cuz by default findOneAndUpdate return the old values before update
    { new: true }
  );
  res.status(200).json({ message: "login Success", userUpdate });
};

// ============================== forget password   ================================================

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  // if user doesnot exist return error
  if (!user) {
    return next(new Error("invalid email", { cause: 400 }));
  }

  // create a reset password link

  const code = nanoid(); // create a code
  const hashedCode = bcrypt.hashSync(code, +process.env.SALT_ROUNDS); // hash the code for further security
  const token = generateToken({
    payload: { email, sentCode: hashedCode },
    signature: process.SIGN_IN_TOKEN_SECRET,
  }); // create a token from the email hashed code to be sent to email for reset password

  const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`;
  const isEmailSent = sendEmailService({
    to: email,
    subject: "reset password email",
    message: emailTemplate({
      link: resetPasswordLink,
      linkData: "Click to Reset your password",
      subject: "Reset Password Email",
    }),
  });

  if (!isEmailSent) {
    return next(new Error("failed to send reset email", { cause: 400 }));
  }
  // save the forgetCode in the db
  const userUpdate = await userModel.findOneAndUpdate(
    { email },
    { forgetCode: hashedCode },
    { new: true }
  );
  res.status(200).json({ message: "Done", userUpdate });
};

// ============================== reset password   ================================================

export const restPassword = async (req, res, next) => {
  const { token } = req.params;
  // verify the sent token  and get the decoded email
  const decoded = verifyToken({
    token,
    signature: process.SIGN_IN_TOKEN_SECRET,
  });

  // find the user that correspondes to the email and the forgetCode that was sent in the token
  const currentUser = await userModel.findOne({
    email: decoded?.email,
    forgetCode: decoded?.sentCode,
  });

  // if there was no user found means he already reset the password before
  if (!currentUser) {
    return next(new Error("the password was rest before ", { cause: 400 }));
  }

  // get the new password from the body
  const { newPassword } = req.body;

  currentUser.password = newPassword;
  currentUser.forgetCode = null;
  // we use save here because the new password need to be hashed before saved in the db
  //by invoking save will call the pre hook of hashing so we donot need to hash the password it will be hashed by the hook
  const restedPassData = await currentUser.save();

  res.status(200).json({ message: "done", restedPassData: restedPassData });
};
