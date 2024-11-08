const DocTimeSlot = require("../../models/timeslot.doctor.model");

const createTimeSlot = async (req, res) => {
    try {
      const reqBody = req.body;
  
      const timeslot = await DocTimeSlot.create(reqBody);
      if (!timeslot) {
        throw new Error("Something went wrong, please try again or later!");
      }
  
      res.status(200).json({
        success: true,
        message: "User create successfully!",
        data: { timeslot },
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  module.exports = { 
    createTimeSlot
  }