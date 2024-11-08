
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();
const {  doctorAuthController, doctorOwnController, doctorTimeSlotController, doctorFlowAppointmentController } = require("../../../controllers");
const authenticDoctor = require("../../../middlewares/doctorAuth");
const { singleFileUpload, multiDiffFileUpload } = require("../../../helpers/upload");
const multer = require('multer');
/* ------------------------------- DOCTOR AUTH ------------------------------ */


/* -------------------------- LOGIN DOCTOR ----------- */
router.post("/doctor-login", 
    doctorAuthController.login);

    // /* -------------------------- FORGOT PASSWORD DOCTOR ----------- */
router.post("/forgot-pass", doctorAuthController.forgotPass);

// // /* -------------------------- VERIFY OTP DOCTOR ----------- */
router.post("/verify-otp", doctorAuthController.verifyOtp);

// // /* -------------------------- RESET PASSWORD DOCTOR ----------- */
router.put("/reset-password", doctorAuthController.resetPassword);

// // /* -------------------------- CHANGE PASSWORD DOCTOR ----------- */
router.post("/change-password", authenticDoctor, doctorAuthController.changePassword);

router.post("/create-time-slot",  doctorTimeSlotController.createTimeSlot);

 
const storage = multer.memoryStorage(); // Use memory storage for direct upload to Cloudinary
const upload = multer({ storage: storage });

router.put(
  '/update-doctor',  
  authenticDoctor,
  upload.fields([
    { name: 'image', maxCount: 1 }, // Field name for doctor's image
  ]),
  doctorOwnController.updateDoctor // Controller function to handle the update
);





module.exports = router;