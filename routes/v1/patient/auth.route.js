
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();
const {   patientAuthController, patientController } = require("../../../controllers");
const authenticPatient = require("../../../middlewares/patientAuth");
const { singleFileUpload, multiDiffFileUpload } = require("../../../helpers/upload");
const multer = require('multer');
/* ------------------------------- DOCTOR AUTH ------------------------------ */

router.post("/create-patient", patientAuthController.register);

/* -------------------------- LOGIN DOCTOR ----------- */
router.post("/patient-login", 
    patientAuthController.login);

    // /* -------------------------- FORGOT PASSWORD DOCTOR ----------- */
router.post("/forgot-pass", patientAuthController.forgotPass);

// // // /* -------------------------- VERIFY OTP DOCTOR ----------- */
router.post("/verify-otp", patientAuthController.verifyOtp);

// // // /* -------------------------- RESET PASSWORD DOCTOR ----------- */
router.put("/reset-password", patientAuthController.resetPassword);

// // // /* -------------------------- CHANGE PASSWORD DOCTOR ----------- */
router.post("/change-password", authenticPatient, patientAuthController.changePassword);

router.put(
    '/update-patient-profile',
    // authenticPatient, // Middleware to authenticate the admin using access token
    singleFileUpload('/patientImg', 'image'), // Middleware to handle image upload (folder name and field name for the file)
    patientController.updatePatientProfile // Controller function to handle the request
  );
module.exports = router;