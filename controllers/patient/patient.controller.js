/* ------------------------------- DEFINE AREA ------------------------------ */
const path = require("path");
const fs = require("fs");

// const deleteFiles =require("../../../helpers/deletefile");

const cloudinary = require('../../config/cloudinaryConfig'); 
const Patient = require("../../models/patient.model");

/* ------------------ NOTE : ALL DETAILS ABOUT DOCTOR  ------------------ */
/* ----------------------------- update Doctor profile ----------------------------- */
// const updateAdminProfile = async (req, res) => {
//   try {
//     const reqbody = req.body;

//     // If there's a file uploaded, remove any existing image first
//     if (req.file) {
//       const admin = await Admin.findById(reqbody.adminId);
//       if(!admin){
//         return res.status(401).json({status:401,success:false, message: "admin not found!"})
//       }
//       if (admin && admin.image) {
//         const imagePath = path.join(__dirname, "/../../../public/adminImg", admin.image);
//         if (fs.existsSync(imagePath)) {
//           fs.unlinkSync(imagePath);
//         } 
//       }
//       reqbody.image = req.file.filename;
//     }
 
//     const admin = await Admin.findById(reqbody.adminId);

//     if (!admin) {
//       throw new Error(` adminId ${reqbody.adminId} not found`);
//     }
//     // Concatenate first name and last name
//     // const fullName = reqbody.first_name + " " + reqbody.last_name;
//     // reqbody.name = fullName;

//     // Update user data in the database
//     const isUpdate = await Admin.findByIdAndUpdate(
//       reqbody.adminId,
//       {
//         $set: reqbody,
//       },
//       { new: true }
//     );
//     res.status(200).json({
//       status: 200,
//       success: true,
//       updateData: isUpdate,
//       message: "Update profile successfully",
//     });
//   } catch (err) {
//     res.status(400).json({ success: false, error: err.message });
//   }
// };

// const cloudinary = require('cloudinary').v2; // Ensure Cloudinary is properly configured
// const Admin = require('../models/Admin'); // Adjust the path to your Admin model

const updatePatientProfile = async (req, res) => {
    try {
      const { patientId } = req.body;
  
      // Validate required fields
      if (!patientId) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: 'adminId is a required field!',
        });
      }
  
      // Fetch the admin's current profile
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: 'patient not found!',
        });
      }
  
      // Initialize an empty object for storing updates
      let updateData = {};
  
      // Check if there is a new file uploaded
      if (req.file) {
        // console.log('Uploaded file:', req.file);
        
        // If there's an existing image, delete it from Cloudinary
        if (patient.image && patient.image.public_id) {
          await cloudinary.uploader.destroy(patient.image.public_id);
        }
  
        // Upload the new image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(req.file.path);
        // console.log('uploadResponse:', uploadResponse);
  
        // Update image field in updateData
        updateData.image = {
          public_id: uploadResponse.public_id,
          url: uploadResponse.secure_url,
        };
        // console.log('Updated image data:', updateData.image);
      }
  
      // Add other fields from req.body to updateData
      for (let key in req.body) {
        if (req.body[key]) {
          updateData[key] = req.body[key];
        }
      }
  
      // Update the admin profile with new image and other fields
      const updatedPatient = await Patient.findByIdAndUpdate(patientId, { $set: updateData }, { new: true });
  
      // Return the updated admin profile
      return res.status(200).json({
        status: 200,
        success: true,
        updateData: updatedPatient,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: err.message });
    }
  };
  
  


  


/* -------------------------- DELETE DOCTOR PROFILE WITH IMAGE------------------------- */
// const deleteDoctor = async (req, res) => {
//   try {
//     const userData = await Doctor.findById(req.params.doctorId);

//     if (!userData) {
//       return res.status(404).json({status:404,success:false, message: "Doctor Data not found" });
//     }
//     const DeletedData = await Doctor.findByIdAndDelete(req.params.doctorId, req.body, {
//       new: true,
//     });

//     deleteFiles("doctorImg/" + userData.image);

//     res.status(200).json({
//       status: 200,
//       success: true,
//       message: "List of Doctor Data successfully ",
//       user: DeletedData,
//     });

//   } catch (error) {
//     res.status(400).json({
//       status: 400,
//       success: false,
//       message: error.message,
//     });
//   }
// };

// const allCountryList = async (req, res) => {
//   try {
//     const country = await Country.find();

//     if (!country) {
//       return res.status(404).json({ message: "country list ata not found" });
//     }

//     res.status(200).json({
//       status: 200,
//       success: true,
//       message: "Country data get successfully ",
//       country: country,
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 404,
//       success: false,
//       message: error.message,
//     });
//   }
// };



module.exports = {
    updatePatientProfile,
//   deleteDoctor,allCountryList
};