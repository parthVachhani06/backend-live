
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();

// const { singleFileUpload } = require("../../../../helpers/upload");
const { dashboardController } = require("../../../../controllers");



/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.get("/doctor-list", dashboardController.allDoctorList);



module.exports = router;
