const Doctor = require("../../models/doctor.model");
const Patient = require("../../models/patient.model");

const searchDoctorAndPatientist = async (req, res) => {
    try {
      const { query } = req.query;
  
      // Check if query parameter is provided
      if (!query) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Query parameter is missing.",
        });
      }
      // Use a regular expression for case-insensitive search
      const regex = new RegExp(query, "i");
  
      // Search in Doctor model
      const doctorResults = await Doctor.find({
        firstName: regex, // Adjust to match the field you are searching against
      });
  
      // Search in Specialist model
      const specialistResults = await Patient.find({
        first_name: regex, // Adjust to match the field you are searching against
      });
  
      // Combine the results from both models
      const combinedResults = [...doctorResults, ...specialistResults];
  
      if (combinedResults.length === 0) {
        return res.status(404).json({
          status: 404,
          success: false,
          message:
            "No matching doctors or specialists found for the given query.",
        });
      }
      // If results are found, return a success response with the combined search results
      res.status(200).json({
        status: 200,
        success: true,
        message: "Search data retrieved successfully.",
        searchResults: combinedResults,
      });
    } catch (error) {
      // console.error("Error in searchDoctorSpecialist:", error);
      res
        .status(500)
        .json({ status: 500, success: false, error: "Internal Server Error" });
    }
  };

  const allDoctorList= async(req,res)=>{
    try {
      const doctors = await Doctor.find();
      res.status(200).json({success:true,doctors,message:'all doctor list is done'});
  } catch (error) {
      // console.error('Error fetching doctors:', error);
      res.status(500).json({ message: 'Internal server error' });
  }

  }

  module.exports = {
    searchDoctorAndPatientist,
    allDoctorList

  }
