/* ------------------------------- DEFINE AREA ------------------------------ */
const path = require("path");
const fs = require("fs");
const bcrypt = require('bcrypt'); // Import bcrypt
// const deleteFiles =require("../../../helpers/deletefile");
const Admin = require("../../models/admin.model");
const Doctor = require("../../models/doctor.model");


const updateDoctor = async (req, res) => {
    try {
      const reqbody = req.body;
  
      // Find the doctor by ID
      const doctor = await Doctor.findById(reqbody.doctorId); // Assuming you're updating a doctor's profile
      if (!doctor) {
        return res.status(404).json({ status: 404, success: false, message: "Doctor not found!" });
      }
  
      // Function to handle image uploads
      const uploadImage = async (file, folder) => {
        if (file) {
          // If the doctor has an existing image, delete it from Cloudinary
          if (doctor[folder] && doctor[folder].public_id) {
            await cloudinary.uploader.destroy(doctor[folder].public_id);
          }
  
          // Upload the new image to Cloudinary
          const uploadResponse = await cloudinary.uploader.upload(file.path, {
            folder: folder, // Define the Cloudinary folder for the image
          });
  
          // Return the new image details
          return {
            public_id: uploadResponse.public_id,
            url: uploadResponse.secure_url,
          };
        }
        return null; // Return null if no file is provided
      };
  
      // Upload the doctor image if it exists
      const newImage = await uploadImage(req.file, 'doctorImg');
      if (newImage) {
        reqbody.image = newImage; // Update reqbody with new image details
      }
  
      // Upload the signature image if it exists
      const newSignatureImage = await uploadImage(req.signatureFile, 'doctorSignatures');
      if (newSignatureImage) {
        reqbody.signatureImage = newSignatureImage; // Update reqbody with new signature image details
      }
  
      // Define fields to update
      const fieldsToUpdate = {
        firstName: reqbody.firstName,
        lastName: reqbody.lastName,
        email: reqbody.email,
        phoneNumber: reqbody.phoneNumber,
        hospitalName: reqbody.hospitalName,
        gender: reqbody.gender,
        country: reqbody.country,
        state: reqbody.state,
        city: reqbody.city,
        image: reqbody.image || doctor.image, // Retain existing image if no new image is uploaded
      };
  
      // Update the doctor profile in the database
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        reqbody.doctorId,
        { $set: fieldsToUpdate },
        { new: true }
      );
  
      // Respond with success
      return res.status(200).json({
        status: 200,
        success: true,
        updateData: updatedDoctor,
        message: "Doctor profile updated successfully",
      });
  
    } catch (err) {
      // Handle errors
      return res.status(400).json({ success: false, error: err.message });
    }
  };
  
  
  module.exports = {
    updateDoctor
  
  };