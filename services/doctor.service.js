
// const Category = require("../models/category.model");


const Doctor = require("../models/doctor.model");

/**
 * Create user
 * @param {object} reqBody
 * @returns {Promise<User>}
 */
const createDoctor = async (reqBody) => {
  return Doctor.create(reqBody);
};

const findDoctorByEmail = async (email) => {
  return Doctor.findOne({ email });
};

const findDoctorByPhoneNumber = async (phoneNumber) => {
  return await Doctor.findOne({ phoneNumber: phoneNumber });
};


module.exports = {
    createDoctor,
    findDoctorByEmail,
    findDoctorByPhoneNumber,
  // findDoctorByPhone,
  // updatePassword,
  // getDoctorById,
  // updateDetails,
  // findHeplByEmailPatient,
};