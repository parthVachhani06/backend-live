
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();

// const { singleFileUpload } = require("../../../../helpers/upload");
const {   prescriptionController, precriptionPatientController } = require("../../../controllers");



/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.post("/create-prescription", prescriptionController.createPrescription);
router.get('/prescriptions-patient-id',prescriptionController.getPrescriptionsByPatientId);
router.get('/list-patient-id',prescriptionController.patientDetailFromDoctorIdInDoctorFlowAppointments);
router.get('/list-patient-id-prescription',prescriptionController.getPrescriptionDetailsByPatientId);
router.get('/list-patient-id-prescription-old',prescriptionController.getOldPrescriptionDetails);
router.get('/list-patient-all-appointment',prescriptionController.getAllAppointments);
router.get('/list-patient-all-appointment-searchinf-fromdate-todate',prescriptionController.getAppointmentsByDateRange);



router.get('/prescriptions-patient-id-list',precriptionPatientController.getPrescriptionsByPatientId);






module.exports = router;
