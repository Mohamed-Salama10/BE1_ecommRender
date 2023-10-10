import joi from "joi";
export const createSubCategorySchema = {
  body: joi
    .object({
      name: joi.string().min(4).max(10),
    })
    .required()
    .options({ presence: "required" }),
};

export const updateSubCategorySchema = {
    body: joi
      .object({
        name: joi.string().min(4).max(10).optional()
      })
      .required()
 
  };
  