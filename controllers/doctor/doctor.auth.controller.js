/* ------------------------------- DEFINE AREA ------------------------------ */
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");

// const { Admin } = require("../../models/admin.model");
const ejs = require("ejs");
const path = require("path");
const {  emailService, doctorService } = require("../../services");
const Doctor = require("../../models/doctor.model");


/* -------------------------- LOGIN/SIGNIN DOCTOR  0-new 1-already -------------------------- */
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Identifier can be either email or phone number

    // Check if identifier and password are provided
    if (!identifier || !password) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Identifier and password are required.",
      });
    }

    // Find the admin by either email or phone number
    const doctor = await Doctor.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    
    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "doctor Not Found",
      });
    }

    // Compare the password with the hashed password in the database
    const successPassword = await bcrypt.compare(password, doctor.password);
    if (!successPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Incorrect Password",
      });
    }

    // Prepare the payload for JWT
    const payload = {
      _id: doctor._id,
      email: doctor.email,
    };

    // Generate JWT token
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1m", // Token expires in 1 minute
    });

    // Optionally store the token in the doctor object
    doctor.token = token;

    // Generate refresh token
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET_KEY
    );

    // Save the doctor document with the new token
    const output = await doctor.save();

    // Construct the base URL for profile path
    const baseUrl =
      req.protocol +
      "://" +
      req.get("host") +
      process.env.BASE_URL_PROFILE_PATH;

    // Respond with success
    res.status(200).json({
      data: output,
      token: token,
      refreshToken: refreshToken,
      baseUrl: baseUrl,
      message: "Login Successful",
      doctorId: output._id,
      status: 200,
      success: true,
    });
  } catch (error) {
    // Handle errors and send a response
    res.status(500).json({
      status: 500,
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


// //   /* -------------------------- LOGIN WITH PHONE NUMBER WITH OTP  -------------------------- */
const forgotPass = async (req, res) => {
  try {
    const { phoneNumber, first_name } = req.body;
    let email = req.body.email;  // Change to let to allow reassignment

     // Ensure that only one field is provided
     if (email && phoneNumber) {
      throw new Error("Please provide either email or phone number, not both");
    }

    // Ensure that either email or phone number is provided
    if (!email && !phoneNumber) {
      throw new Error("Please provide either email or phone number");
    }

    let findDoctor;

    // If phone number is provided, find the admin and retrieve the email
    if (phoneNumber) {
      findDoctor = await doctorService.findDoctorByPhoneNumber(phoneNumber);
      if (!findDoctor) {
        throw new Error("doctor Not Found");
      }
      // Use the found admin's email for sending the OTP
      email = findDoctor.email; // Retrieve the email from the admin object
    } else if(email) {
      // email = req.body.email; // Get the email directly if it is provided
      findDoctor = await doctorService.findDoctorByEmail(email);
      if (!findDoctor) {
        throw new Error("Admin Not Found");
      }
    }

    // Generate a random OTP (6 digits)
    const otp = ("0".repeat(6) + Math.floor(Math.random() * 10 ** 6)).slice(-6);
    findDoctor.otp = otp;
    await findDoctor.save();

    // Send OTP via email
    if (email) {
      // Render the OTP email template and send email
      ejs.renderFile(
        path.join(__dirname, "../../views/otp-template.ejs"),
        {
          email: email,
          otp: otp,
          name: first_name,
        },
        async (err, data) => {
          if (err) {
            throw new Error("Error rendering email template");
          } else {
            await emailService.sendMail(email, data, "Verify Email");
          }
        }
      );
    }

    // Send a success response
    res.status(200).json({
      success: true,
      message: `OTP has been sent via email`,
      data: `Admin OTP is ${otp}`,
      adminId: findDoctor._id,
      status: 200,
    });
  } catch (error) {
    // Send error response
    res.status(400).json({ success: false, message: error.message });
  }
};


// // /* ------------------------------- VERIFY OTP ------------------------------- */
const verifyOtp = async (req, res) => {
    try {
      const { otp, email, phoneNumber } = req.body;
  
      // Ensure that either email or phone number is provided
      if (!email && !phoneNumber) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Please provide either email or phone number",
        });
      }
  
      // Find the doctor based on either email or phone_number
      let doctor;
      if (email) {
        doctor = await Doctor.findOne({ email });
      } else if (phoneNumber) {
        doctor = await Doctor.findOne({ phoneNumber });
      }
  
      // Check if the doctor exists
      if (!doctor) {
        return res.status(404).json({
          status: 404,
          success: false,
          message: "Doctor Not Found",
        });
      }
  
      // Check if OTP is expired using expireOtpTime
      if (new Date(doctor.expireOtpTime).toTimeString() <= new Date(Date.now()).toTimeString()) {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "OTP has expired",
        });
      }
  
      // Compare OTP
      if (doctor.otp === otp) {
        return res.status(200).json({
          status: 200,
          success: true,
          message: "OTP Verification Successful",
        });
      } else {
        return res.status(400).json({
          status: 400,
          success: false,
          message: "Invalid OTP",
        });
      }
    } catch (error) {
      // Handle error and send a 500 response
      res.status(500).json({ error: error.message });
    }
  };
  


// // /* ----------------------------- RESET PASSWORD ----------------------------- */
const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, doctorId } = req.body;

    // console.log(id);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "New Password And Confirm Password Do Not Match.",
      });
    }
    let doctor = await Doctor.findById(doctorId);
    // Checking if the user is in the database or not
    if (!doctor) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "doctor Does Not Exist!",
      });
    }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        doctor.password = hashedPassword; // Set the new hashed password
    
            // Save the updated admin document
    await doctor.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Password Reset Successfully!",
      data: doctor,
      doctorId:doctor._id,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// // /* ----------------------------- CHANGE PASSWORD ---------------------------- */
const changePassword = async (req, res) => {
  try {
    const { oldpass, newpass, confirmpass, doctorId } = req.body; // assuming patientId is provided in the request body
    // console.log(req.body, "++++++++++++++");

    // Find the patient by their ID
    const doctor = await Doctor.findById(doctorId);
    // console.log(doctor, "++++++++++++++++++++++++++++++++");
    if (!doctor) {
      return res
        .status(404)
        .json({ status: 404, success: false, error: "doctor not found" });
    }

    // Verify the old password
    const isPasswordCorrect = await bcrypt.compare(oldpass, doctor.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: 401, success: false, error: "Incorrect old password" });
    }

    // Check if the new password and confirm password match
    if (newpass !== confirmpass) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: "New password and confirm password do not match",
      });
    }

    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(newpass, 8);
    doctor.password = hashedPassword;
    await doctor.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully",
      doctorId:doctor._id,
      doctor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
    login,

  forgotPass,
  verifyOtp,
  resetPassword,
  changePassword,

};