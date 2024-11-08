
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();

// const { singleFileUpload } = require("../../../../helpers/upload");
const {   patientFlowPersonalHealthRecordController } = require("../../../controllers");



/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.get("/personal-details-list", patientFlowPersonalHealthRecordController.getpatintDetails);
router.get("/personal-details-list-medical", patientFlowPersonalHealthRecordController.getPatientAppointmentsMedical);
router.get("/personal-details-list-medical-persnoal", patientFlowPersonalHealthRecordController.getPatientAppointmentsMedicalPersnoal);

router.get("/personal-details-list-medical-prescriptions-views", patientFlowPersonalHealthRecordController.getPatientDetailsMedicalView);




module.exports = router;
