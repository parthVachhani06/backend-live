
module.exports.authAdminController = require("./admin/register.controller");
module.exports.hospitalController = require("./hospital/hospital.controller");
module.exports.adminController = require("./admin/admin.controller");
module.exports.doctorController = require("./admin/doctor.controller");

module.exports.doctorAuthController = require("./doctor/doctor.auth.controller");

module.exports.doctorOwnController = require("./doctor/controller.doctor");



module.exports.patientAuthController = require("./patient/auh.patient.controller");

module.exports.patientController = require("./patient/patient.controller");

// /* --------------------------------- PATIRNT -------------------------------- */

module.exports.dashboardController = require("./admin/dashboard.controller");

module.exports.bookapointmentPatientController = require("./bookapointment/bookApointment.controller");

module.exports.doctorTimeSlotController = require("./doctor/timeslot.doctor.controller");

module.exports.doctorFlowAppointmentController = require("./bookapointment/doctorflow.controller");

module.exports.prescriptionController = require("./prescription/prescription.controller");

module.exports.telecommunicationController = require("./telecommunications/telecommunication.controller");

module.exports.patientFlowPersonalHealthRecordController = require("./patient/personal health record/personal.health.record.patientflow.controller");

module.exports.patintFlowBookappointmentController = require("./bookapointment/patientflow.controller");

module.exports.precriptionPatientController = require("./prescription/prescription.patient.controller");

// module.exports.favoriteDoctorController = require("./Patient/app/favoritedoctor.controller");
