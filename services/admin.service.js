// const Category = require("../models/category.model");

const Admin = require("../models/admin.model");

/**
 * Create user
 * @param {object} reqBody
 * @returns {Promise<User>}
 */
const createAdmin = async (reqBody) => {
  return Admin.create(reqBody);
};

const findAdminByEmail = async (email) => {
  return Admin.findOne({ email });
};

const findAdminByPhoneNumber = async (phone_number) => {
  return await Admin.findOne({ phone_number: phone_number });
};


// const findHeplByEmailPatient = async (email) => {
//   return Patient.findOne({ email });
// };
// const findAdminByPhone = async (phoneNumber) => {
//   return Admin.findOne({ phoneNumber });
// };

// const updatePassword = async (doctorId, newPassword) => {
//   return Doctor.findByIdAndUpdate(doctorId, { password: newPassword });
// };

// const getDoctorById = async (doctorId) => {
//   return Doctor.findById(doctorId);
// };

// const updateDetails = async (doctorId, updateBody) => {
//   return Doctor.findByIdAndUpdate(doctorId, { $set: updateBody });
// };

module.exports = {
  createAdmin,
  findAdminByPhoneNumber,
  findAdminByEmail,
  // findDoctorByPhone,
  // updatePassword,
  // getDoctorById,
  // updateDetails,
  // findHeplByEmailPatient,
};