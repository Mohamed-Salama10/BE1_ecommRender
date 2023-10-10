import multer from "multer";

// allowed extinson object that  contains an array for the allowed extensions

export const multerCloudFunction = (allowedExtensionArray) => {
  // allowedExtensionArray: array contain the allowed extensions for each api

  if (!allowedExtensionArray) {
    allowedExtensionArray = filesExtensions.images;
  }

  // ======================== storage parameters==================
  const storage = multer.diskStorage({
    // in case of cloudinary it is left empty but it is a must arrg to be sent to fileupload
  });

  // ======================== file filter ==================

  const fileFilter = function (req, file, cb) {
    
    if (allowedExtensionArray.includes(file.mimetype)) {
      return cb(null, true);
    }
    console.log(allowedExtensionArray);
    cb(new Error("invalid extension", { cause: 400 }), false);
  };

  // ======================== initiate  multer  using storage options ==================

  const fileUpload = multer({ fileFilter, storage });

  // ======================== return file upload tp be used  ==================

  return fileUpload;
};
