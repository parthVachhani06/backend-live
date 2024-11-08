/* ------------------------------- DEFINE AREA ------------------------------ */
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");

// const { Admin } = require("../../models/admin.model");
const ejs = require("ejs");
const path = require("path");
const {  emailService, patientService } = require("../../services");

const Patient = require("../../models/patient.model");

/* -------------------------- REGISTER/CREATE DOCTOR -------------------------- */
const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      password,
      confirmPassword,
      email,
      phone_number,
      country,
      state,
      city,
      age,
      patient_address,
      gender,
      dob,
      blood_group,
      weight,
      height,
    } = req.body;
  // Convert dob to a Date object and ensure it's in UTC
  const dobUTC = new Date(new Date(dob).toISOString().split('T')[0]);

    // Check if required fields are missing
    if (
      !email ||
      !password ||
      !first_name ||
      !phone_number ||
      !confirmPassword ||
      !city ||
      !last_name ||
      !country ||
      !state ||
      !age ||
      !patient_address ||
      !gender ||
      !dob ||
      !blood_group ||
      !weight ||
      !height
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Required Fields.",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New Password And Confirm Password Do Not Match.",
      });
    }

    // Check if user with the same email already exists
    const existingPatient = await patientService.findPatientByEmail(email);
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient With This Email Already Exists.",
      });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 8);

    // JWT token creation
    let option = {
      email,
      exp: moment().add(1, "days").unix(),
    };
    const token = await jwt.sign(option, process.env.JWT_SECRET_KEY);

    // Generate refresh token
    const refreshToken = await jwt.sign(
      option,
      process.env.JWT_REFRESH_SECRET_KEY
    );

    // Prepare data for creating patient
    const filter = {
      email,
      first_name,
      phone_number,
      password: hashPassword,
      token,
      refreshToken,
      city,
      country,
      last_name,
      state,
      age,
      patient_address,
      gender,
      dob: dobUTC,  // Storing dob as a Date object
      blood_group,
      weight,
      height,
    };

    // Create patient
    const data = await patientService.createPatient(filter);

    // Format dob in "2 Jan 2022" format
    const formattedDob = new Date(data.dob).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Patient Registered Successfully",
      status: 200,
      data: {
        ...data._doc,  // Spread operator to keep the existing patient data
        dob: formattedDob,  // Overwrite dob with formatted date
      },
      patientId: data._id,
      refreshToken: refreshToken, // Include refresh token in the response
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({ error: err.message });
  }
};


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
    const patient = await Patient.findOne({
      $or: [{ email: identifier }, { phone_number: identifier }],
    });
    
    // Check if admin exists
    if (!patient) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "patient Not Found",
      });
    }

    // Compare the password with the hashed password in the database
    const successPassword = await bcrypt.compare(password, patient.password);
    if (!successPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Incorrect Password",
      });
    }

    // Prepare the payload for JWT
    const payload = {
      _id: patient._id,
      email: patient.email,
    };

    // Generate JWT token
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m", // Token expires in 1 minute
    });

    // Optionally store the token in the admin object
    patient.token = token;

    // Generate refresh token
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET_KEY
    );

    // Save the admin document with the new token
    const output = await patient.save();

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
      patientId: output._id,
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
    const { phone_number, first_name } = req.body;
    let email = req.body.email; // Use let to allow reassignment

    // Ensure that only one field is provided
    if (email && phone_number) {
      throw new Error("Please provide either email or phone number, not both");
    }

    if (!email && !phone_number) {
      throw new Error("Please provide either email or phone number");
    }

    let findPatient;

    // If phone number is provided, find the patient and retrieve the email
    if (phone_number) {
      findPatient = await patientService.findPatientByPhoneNumber(phone_number);
      if (!findPatient) {
        throw new Error("Patient Not Found");
      }
      email = findPatient.email; // Reassign email here
    } else if (email) {
      // If email is provided, find the patient by email
      findPatient = await patientService.findPatientByEmail(email);
      if (!findPatient) {
        throw new Error("Patient Not Found");
      }
    }

    // Generate a random OTP (6 digits)
    const otp = ("0".repeat(6) + Math.floor(Math.random() * 10 ** 6)).slice(-6);
    findPatient.otp = otp;
    await findPatient.save();

    // Send OTP via email
    if (email) {
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
      data: `Patient OTP is ${otp}`,
      patientId: findPatient._id,
      status: 200,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



// /* ------------------------------- VERIFY OTP ------------------------------- */
const verifyOtp = async (req, res) => {
  try {
    const { otp, identifier } = req.body; // Assuming you pass either phone number or email as identifier

    // Ensure that OTP and identifier (phone/email) are provided
    if (!otp || !identifier) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please provide otp and identifier (phone or email)",
      });
    }

    // Find the patient by identifier (e.g., phone number or email)
    const patient = await Patient.findOne({ 
      $or: [{ phone_number: identifier }, { email: identifier }] 
    });

    // Check if patient exists
    if (!patient) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Patient not found",
      });
    }

    // Check if OTP is expired (5 seconds expiration)
    const otpGeneratedAt = patient.otpGeneratedAt; // Timestamp when OTP was generated
    const currentTime = Date.now();
    const otpExpiryTime = 5000; // 5 seconds in milliseconds

    if (currentTime - otpGeneratedAt > otpExpiryTime) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "OTP has expired",
      });
    }

    // Compare OTP
    if (patient.otp === otp) {
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

// /* ----------------------------- RESET PASSWORD ----------------------------- */
const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, patientId } = req.body;

    // console.log(id);

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "New Password And Confirm Password Do Not Match.",
      });
    }
    let patient = await Patient.findById(patientId);
    // Checking if the user is in the database or not
    if (!patient) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "patient Does Not Exist!",
      });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    patient.password = hashedPassword; // Set the new hashed password

    // Save the updated admin document
    await patient.save();
    res.status(200).json({
      status: 200,
      success: true,
      message: "Password Reset Successfully!",
      data: patient,
      patientId:patient._id,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
// /* ----------------------------- CHANGE PASSWORD ---------------------------- */
const changePassword = async (req, res) => {
  try {
    const { oldpass, newpass, confirmpass, patientId } = req.body; // assuming patientId is provided in the request body
    // console.log(req.body, "++++++++++++++");

    // Find the patient by their ID
    const patient = await Patient.findById(patientId);
    // console.log(admin, "++++++++++++++++++++++++++++++++");
    if (!patient) {
      return res
        .status(404)
        .json({ status: 404, success: false, error: "admin not found" });
    }

    // Verify the old password
    const isPasswordCorrect = await bcrypt.compare(oldpass, patient.password);
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
    patient.password = hashedPassword;
    await patient.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully",
      patientId:patient._id,
      patient,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  register,
    login,
  forgotPass,
  verifyOtp,
  resetPassword,
  changePassword,
};