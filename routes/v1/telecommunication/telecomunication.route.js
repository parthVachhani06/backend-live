

/* ------------------------------- DEFINE AREA ------------------------------ */
const express = require("express");
const router = express.Router();

// const { singleFileUpload } = require("../../../../helpers/upload");
const {  telecommunicationController } = require("../../../controllers");



/* -------------------------- CREATE/SIGNUP DOCTOR ----------- */
router.get("/telecom-today-appointment", telecommunicationController.getTodayAppointments);
router.get("/telecom-upcomming-appointment", telecommunicationController.getUpcomingAppointments);
router.get("/telecom-upcomming-appointment-search-patient-name", telecommunicationController.getUpcomingAppointmentsSearch);
router.get("/telecom-previous-appointment", telecommunicationController.getPreviousAppointments);
router.get("/telecom-previous-appointment-search-patient-name", telecommunicationController.getPreviousAppointmentsSearch);
router.get("/telecom-cancel-appointment", telecommunicationController.getCanceledAppointments);
router.get("/telecom-cancel-appointment-search-patient-name", telecommunicationController.getCanceledAppointmentsSearch);
router.get("/telecom-after-join-call-appointment-reminder", telecommunicationController.getAppointmentDetailsById);
router.put('/telecom-create-call', telecommunicationController.updateJoinCall);






module.exports = router;
