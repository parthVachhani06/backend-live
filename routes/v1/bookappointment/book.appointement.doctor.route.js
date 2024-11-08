
/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();

// const { singleFileUpload } = require("../../../../helpers/upload");
const { patintFlowBookappointmentController } = require("../../../controllers");



/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.get("/bookappointement-today-list-appointement-book", patintFlowBookappointmentController.getTodaysAppointmentsForPatient);
router.get("/searching-bookappointement-today-list-appointement-book", patintFlowBookappointmentController.getAppointmentsForPatientInRange);
router.get("/bookappointement-today-appointement-doctor-details-list", patintFlowBookappointmentController.getPatientAppointmentsWithDoctor);

router.get("/bookappointement-previous-list-appointement-book", patintFlowBookappointmentController.getPreviousAppointmentsForPatient);
router.get("/searching-bookappointement-previous-list-appointement-book", patintFlowBookappointmentController.getPreviousAppointmentsForPatientInRange);
router.get("/bookappointement-previous-appointement-doctor-details-list", patintFlowBookappointmentController.getPatientAppointmentsWithDoctorPrevious);

router.get("/bookappointement-cancel-list-appointement-book", patintFlowBookappointmentController.getCanceledAppointments);
// router.get("/searching-bookappointement-cancel-list-appointement-book", patintFlowBookappointmentController.getCanceledAppointmentsInRange);
router.get("/bookappointement-cancel-appointement-doctor-details-list", patintFlowBookappointmentController.getPatientAppointmentsWithDoctorcancel);


router.get("/bookappointement-pending-list-appointement-book", patintFlowBookappointmentController.getPendingAppointments);
router.get("/searching-bookappointement-pending-list-appointement-book", patintFlowBookappointmentController.getPendingAppointmentsInRange);
router.get("/bookappointement-pending-appointement-doctor-details-list", patintFlowBookappointmentController.getPatientAppointmentsWithDoctorPending);


module.exports = router;
