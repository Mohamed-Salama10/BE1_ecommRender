import multer from "multer";
import { customAlphabet } from "nanoid";
import path from "path";
import fs from "fs";

// allowed extinson object that  contains an array for the allowed extensions
export const filesExtensions = {
  images: ["jpg", "jpeg", "png", "gif", "bmp"],
  files: ["txt", "pdf", "doc", "docx", "ppt", "pptx"],
  videos: ["mp4", "avi", "mkv", "mov", "wmv"],
};

export const multerFunction = (allowedExtensionArray, customPath) => {
  // allowedExtensionArray: array contain the allowed extensions for each api

  const nanoid = customAlphabet("1234567890qwertyuiop[]asdfghjkl;'zxcvbn/", 6); // generate a unique id to concat on the filename to avoid any conflict in names

  if (!allowedExtensionArray) {
    allowedExtensionArray = filesExtensions.images;
  }
  if (!customPath) {
    customPath = "general";
  }
  const destPath = path.resolve(`local_uploads/${customPath}`);
  // ======================== custom path ==================
  // create the custom directory if not exist
  // recursive if true  if parent folder doesnot exist it will create it also
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  // ======================== storage parameters==================
  const storage = multer.diskStorage({
    // local_uploads is the destination where the files uploaded locally
    destination: function (req, file, cb) {
      cb(null, destPath);
    },

    filename: function (req, file, cb) {
      const uniqueFileName = nanoid() + file.originalname; // concat the original file name with the unique string to create unique name

      //store the file with unique name
      cb(null, uniqueFileName);
    },
  });

  // ======================== file filter ==================

  const fileFilter = function (req, file, cb) {
    if (allowedExtensionArray.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("invalid extension" /*{ cause: 400 }*/), false);
  };

  // ======================== initiate  multer  using storage options ==================

  const fileUpload = multer({ fileFilter, storage });

  // ======================== return file upload tp be used  ==================

  return fileUpload;
};
