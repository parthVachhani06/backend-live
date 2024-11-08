
// const Category = require("../models/category.model");
const Patient = require("../models/patient.model");

/**
 * Create user
 * @param {object} reqBody
 * @returns {Promise<User>}
 */
const createPatient = async (reqBody) => {
  return Patient.create(reqBody);
};

const findPatientByEmail = async (email) => {
  return Patient.findOne({ email });
};

const findPatientByPhoneNumber = async (phone_number) => {
  return await Patient.findOne({ phone_number: phone_number });
};


module.exports = {
    createPatient,
    findPatientByEmail,
    findPatientByPhoneNumber,
};