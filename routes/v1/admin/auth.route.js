
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();
const { authAdminController, adminController, doctorController } = require("../../../controllers");
const authenticAdmin = require("../../../middlewares/adminAuth");
const { singleFileUpload, multiDiffFileUpload } = require("../../../helpers/upload");
const multer = require('multer');
const { adminAuthValidation } = require("../../../validations");
const validate = require("../../../middlewares/validate");
/* ------------------------------- DOCTOR AUTH ------------------------------ */

/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.post("/create-admin", validate(adminAuthValidation.createAdminRegister), authAdminController.register);

/* -------------------------- LOGIN DOCTOR ----------- */
router.post("/admin-login", 
    // authenticAdmin,
 authAdminController.login);

// /* -------------------------- FORGOT PASSWORD DOCTOR ----------- */
router.post("/forgot-pass", authAdminController.forgotPass);

// /* -------------------------- VERIFY OTP DOCTOR ----------- */
router.post("/verify-otp", authAdminController.verifyOtp);

// /* -------------------------- RESET PASSWORD DOCTOR ----------- */
router.put("/reset-password", authAdminController.resetPassword);

// /* -------------------------- CHANGE PASSWORD DOCTOR ----------- */
router.post("/change-password", authenticAdmin, authAdminController.changePassword);

// /* -------------------------- UPDATE DOCTOR PROFILE DOCTOR ----------- */
// router.put(
//   "/update-admin-profile",
//   accessToken(),
//   singleFileUpload("/adminImg", "image"),
//   adminController.updateAdminProfile
// );

router.put(
  '/update-admin-profile',
  authenticAdmin, // Middleware to authenticate the admin using access token
  singleFileUpload('/adminImg', 'image'), // Middleware to handle image upload (folder name and field name for the file)
  adminController.updateAdminProfile // Controller function to handle the request
);
// router.post(
  //   "/add-docor-by-admin",
  //   // accessToken(),
//   multiDiffFileUpload("/doctorImg", [
//     { name: "signatureImage", maxCount: 1, allowedMimes: ["image/png", "image/jpeg", "image/jpg"] },
//     { name: "image", maxCount: 1, allowedMimes: ["image/png", "image/jpeg", "image/jpg"] },
//   ]),
//   // singleFileUpload("/doctorImg", "signatureImage"),
//   doctorController.addDoctorByAdmin
// );

const uploadMiddleware = multiDiffFileUpload("/doctorImg", [
  {
    name: "image",
    maxCount: 1,
    allowedMimes: ["image/jpeg", "image/png", "image/gif"], // Add allowed types
  },
  {
    name: "signatureImage",
    maxCount: 1,
    allowedMimes: ["image/jpeg", "image/png", "image/gif"], // Add allowed types
  },
]);

router.post(
  "/add-doctor-by-admin",
  authenticAdmin,
  uploadMiddleware,
  doctorController.addDoctorByAdmin
);


const storage = multer.memoryStorage(); // Use memory storage for direct upload to Cloudinary
const upload = multer({ storage: storage });

router.put(
  '/update-doctor-by-admin', 
  authenticAdmin,
  upload.fields([
    { name: 'image', maxCount: 1 }, // Field name for doctor's image
    { name: 'signatureImage', maxCount: 1 }, // Field name for doctor's signature image
  ]),
  doctorController.updateDoctorByAdmin // Controller function to handle the update
);

router.get("/list-docotr/:adminId",
  authenticAdmin,
  doctorController.listDoctorAdmin);

router.get("/search-docotr-by-admin",
  authenticAdmin,
  doctorController.searchDoctorByAdmin);

router.get("/list-all-docotr-by-admin",
  authenticAdmin, 
  doctorController.listAllDoctorByAdmin);


// /* -------------------------- DELTE DOCTOR PROFILE DOCTOR ----------- */
router.delete(
  "/delete-doc-by-admin",
  authenticAdmin,
  doctorController.deleteDoctorByAdmin
);


module.exports = router;
