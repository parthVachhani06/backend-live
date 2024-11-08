// const mongoose = require("mongoose");

const Hospital = require("../../models/hospital.model");
/* ------------------------------- CREATE Hospital  ------------------------------- */
const createHospital= async (req, res) => {
  try {
    const reqBody = req.body;   
    const hospital = await Hospital.create(reqBody);
    if (!hospital) {
      throw new Error("Failed to create hospital");
    }
    res.status(200).json({
      status:200,
      message: "Successfully created a new hospital",
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
module.exports = {
    createHospital,
 
  };
