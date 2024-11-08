const Joi = require("joi");

/** Create Admin */
const createAdminRegister = {
  body: Joi.object({
    first_name: Joi.string().required().trim(),
    password: Joi.string().optional(),
    email: Joi.string().allow(""),
    last_name: Joi.string().required(),
    phone_number: Joi.number().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    hospitalId: Joi.string().required(),
    agree: Joi.boolean().required(),
    confirmPassword: Joi.string().required(),
  }),
};


/** Create Admin */
const loginAdmin = {
  body: Joi.object({
    identifier: Joi.string().required().trim(),
    password: Joi.string().optional(),
  }),
};

/** Create Admin */
const forgotPasswordAdmin = {
  body: Joi.object({
    phone_number: Joi.string().trim(),
    email: Joi.string().email().trim(),
    first_name: Joi.string().optional(),
  }).xor('phone_number', 'email'), // At least one of phone_number or email must be provided
};


/** Create Admin */
const verifyOtpdAdmin = {
  body: Joi.object({
    otp: Joi.string().trim(),
  })
};

const resetPasswordAdmin = {
  body: Joi.object({
    newPassword: Joi.string().required().trim(),
    confirmPassword: Joi.string().optional(),
    adminId: Joi.string().optional(),
  }),
};


const changePasswordAdmin = {
  body: Joi.object({
    oldpass: Joi.string().required().trim(),
    confirmpass: Joi.string().required().trim(),
    newpass: Joi.string().optional(),
    adminId: Joi.string().optional(),
  }),
};

const updatedAdminProfle = {
  body: Joi.object({
    adminId: Joi.string().required().trim(),
    first_name: Joi.string().required().trim(),
    last_name: Joi.string().optional(),
    email: Joi.string().optional(),
    phone_number: Joi.string().required().trim(),
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().required().trim(),
    hospitalId: Joi.string().optional(),
    gender: Joi.string().optional(),
    image: Joi.string().required().trim(),
  }),
};

// /** Get product details */
// const getDetails = {
//   params: Joi.object({
//     productId: Joi.string().required().trim(),
//   }),
// };

// /** Get production list */
// const getList = {
//   query: Joi.object({
//     search: Joi.string().trim().allow(""),
//     sortBy: Joi.string().trim().allow(""),
//     limit: Joi.number().integer().allow("").default(10),
//     page: Joi.number().integer().allow("").default(1),
//   }),
// };

// /** Update product details */
// const updateProduct = {
//   params: Joi.object({
//     productId: Joi.string().required().trim(),
//   }),
//   body: Joi.object({
//     product_name: Joi.string().trim().optional(),
//     product_description: Joi.string().optional(),
//     product_image: Joi.string().optional(),
//     price: Joi.number().optional(),
//     category: Joi.string().optional(),
//   }),
// };

module.exports = {
  createAdminRegister,
  loginAdmin,
  forgotPasswordAdmin,
  verifyOtpdAdmin,resetPasswordAdmin,changePasswordAdmin,updatedAdminProfle
};