/* ------------------------------- DEFINE AREA ------------------------------ */
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");

// const { Admin } = require("../../models/admin.model");
const ejs = require("ejs");
const path = require("path");
const { adminService, emailService } = require("../../services");
const Admin = require("../../models/admin.model");

/* -------------------------- REGISTER/CREATE DOCTOR -------------------------- */
const register = async (req, res) => {
  try {
    const {
      first_name,
      password,
      email,
      last_name,
      phone_number,
      confirmPassword,
      country,
      state,
      city,
      hospitalId,
      agree

    
    } = req.body;

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
      !state || !hospitalId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing Required Fields.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email Format.",
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password Must Be At Least 8 Characters Long and Contain At Least One Uppercase Letter, One Lowercase Letter, And One Number.",
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
    const existingAdmin = await adminService.findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin With This Email Already Exists.",
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

    // Prepare data for creating doctor
    const filter = {
      email,
      first_name,
      phone_number,
      password: hashPassword,
      token,
      refreshToken, // Include refresh token in the data
      city,
      country,
      last_name,
      state,
      hospitalId,
      agree
    };

    // Create doctor
    const data = await adminService.createAdmin(filter);

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Admin Registered Successfully",
      status: 200,
      data: data,
      adminId: data._id,
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
    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { phone_number: identifier }],
    });
    
    // Check if admin exists
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin Not Found",
      });
    }

    // Compare the password with the hashed password in the database
    const successPassword = await bcrypt.compare(password, admin.password);
    if (!successPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Incorrect Password",
      });
    }

    // Prepare the payload for JWT
    const payload = {
      _id: admin._id,
      email: admin.email,
    };

    // Generate JWT token
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m", // Token expires in 1 minute
    });

    // Optionally store the token in the admin object
    admin.token = token;

    // Generate refresh token
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET_KEY
    );

    // Save the admin document with the new token
    const output = await admin.save();

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
      adminId: output._id,
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
    let email = req.body.email;  // Change to let to allow reassignment

     // Ensure that only one field is provided
     if (email && phone_number) {
      throw new Error("Please provide either email or phone number, not both");
    }

    // Ensure that either email or phone number is provided
    if (!email && !phone_number) {
      throw new Error("Please provide either email or phone number");
    }

    let findAdmin;

    // If phone number is provided, find the admin and retrieve the email
    if (phone_number) {
      findAdmin = await adminService.findAdminByPhoneNumber(phone_number);
      if (!findAdmin) {
        throw new Error("Admin Not Found");
      }
      // Use the found admin's email for sending the OTP
      email = findAdmin.email; // Retrieve the email from the admin object
    } else {
     // Get the email directly if it is provided
      findAdmin = await adminService.findAdminByEmail(email);
      if (!findAdmin) {
        throw new Error("Admin Not Found");
      }
    }

    // Generate a random OTP (6 digits)
    const otp = ("0".repeat(6) + Math.floor(Math.random() * 10 ** 6)).slice(-6);
    findAdmin.otp = otp;
    await findAdmin.save();

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
      adminId: findAdmin._id,
      status: 200,
    });
  } catch (error) {
    // Send error response
    res.status(400).json({ success: false, message: error.message });
  }
};


// /* ------------------------------- VERIFY OTP ------------------------------- */
const verifyOtp = async (req, res) => {
  try {
    const { otp, email, phone_number } = req.body;

    // Ensure that either email or phone_number is provided
    if (!otp ) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Please provide otp to further verification",
      });
    }

    // Find the admin based on either email or phone_number
    let admin;
    if (email) {
      admin = await Admin.findOne({ email });
    } else if (phone_number) {
      admin = await Admin.findOne({ phone_number });
    }

    // Check if admin exists
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin Not Found",
      });
    }

    // Check if the OTP is expired (5 seconds expiration)
    const otpGeneratedAt = admin.otpGeneratedAt; // Timestamp when OTP was generated
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
    if (admin.otp === otp) {
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
    const { newPassword, confirmPassword, adminId } = req.body;
    
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "New Password And Confirm Password Do Not Match.",
      });
    }

    // Find the admin by adminId
    let admin = await Admin.findById(adminId);
    
    // Check if the admin exists
    if (!admin) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "Admin Does Not Exist!",
      });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword; // Set the new hashed password

    // Save the updated admin document
    await admin.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Password Reset Successfully!",
      adminId: admin._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// /* ----------------------------- CHANGE PASSWORD ---------------------------- */
const changePassword = async (req, res) => {
  try {
    const { oldpass, newpass, confirmpass, adminId } = req.body; // assuming patientId is provided in the request body
    // console.log(req.body, "++++++++++++++");

    // Find the patient by their ID
    const admin = await Admin.findById(adminId);
    // console.log(admin, "++++++++++++++++++++++++++++++++");
    if (!admin) {
      return res
        .status(404)
        .json({ status: 404, success: false, error: "admin not found" });
    }

    // Verify the old password
    const isPasswordCorrect = await bcrypt.compare(oldpass, admin.password);
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
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Password updated successfully",
      adminId:admin._id,
      admin,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const socialLogin = async (req, res) => {
//   try {
//     const { email, name, fcm_token } = req.body;

//     // Check if required fields are missing
//     if (!email || !name) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields.",
//       });
//     }

//     // Check if user with the same email already exists
//     let existingUser = await doctorService.findDoctorByEmail(email);

//     // Prepare data for updating or creating doctor
//     const filter = {
//       email,
//       name,
//       fcm_token,
//     };

//     let statussocial; // Variable to hold statussocial value

//     if (existingUser) {
//       // Update existing user's fcm_token and token
//       filter.token = await jwt.sign({ email }, process.env.JWT_SECRET_KEY);
//       filter.refreshToken = await jwt.sign(
//         { email },
//         process.env.JWT_REFRESH_SECRET_KEY
//       );
//       existingUser = await Doctor.findOne({ email });
//       statussocial = 0; // Existing user
//     } else {
//       // Create new user
//       filter.token = await jwt.sign({ email }, process.env.JWT_SECRET_KEY);
//       filter.refreshToken = await jwt.sign(
//         { email },
//         process.env.JWT_REFRESH_SECRET_KEY
//       );
//       existingUser = await doctorService.createDoctor(filter);
//       statussocial = 1; // New user
//     }

//     // Respond with success message
//     res.status(200).json({
//       success: true,
//       message: existingUser
//         ? "Doctor's details updated successfully"
//         : "New doctor created successfully",
//       status: 200,
//       data: existingUser,
//       refreshToken: filter.refreshToken, // Include refresh token in the response
//       statussocial: statussocial, // Include statussocial in the response
//     });
//   } catch (err) {
//     // Handle errors
//     res.status(500).json({ error: err.message });
//   }
// };

module.exports = {
  register,
  forgotPass,
  verifyOtp,
  login,
  resetPassword,
  changePassword,
  // socialLogin,
};