const AppointmentBook = require("../../models/bookAppointment.model");
const Prescription = require("../../models/prescription.model");
const moment = require('moment-timezone')
const getPrescriptionsByPatientId = async (req, res) => {
    try {
        const { patientId } = req.body; // Get patientId from the request body
  
        // Fetch all appointments for the given patientId and populate doctor and hospital details
        const appointments = await AppointmentBook.find({ patientId })
            .populate('doctorId', 'firstName') // Populate doctor's first name
            .populate('hospitalId', 'hospitalName'); // Populate hospital's name
  
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No appointments found for the given patient",
                success: false,
            });
        }
  
        // Get all appointment IDs
        const appointmentIds = appointments.map(appointment => appointment._id);
  
        // Fetch prescriptions that match any of the appointment IDs
        const prescriptions = await Prescription.find({ appointmentId: { $in: appointmentIds } });
  
        if (!prescriptions || prescriptions.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "No prescriptions found for the given patient",
                success: false,
            });
        }
  
        // Combine prescriptions with relevant appointment details
        const detailedPrescriptions = prescriptions.map(prescription => {
            // Find the corresponding appointment for each prescription
            const appointment = appointments.find(app => app._id.toString() === prescription.appointmentId.toString());
            return {
                prescriptionId: prescription._id,
                doctorFirstName: appointment.doctorId.firstName, // Doctor's first name
                hospitalName: appointment.hospitalId.hospitalName, // Hospital name
                diseaseName: prescription.disease_name, // Assuming `disease_name` is a field in the Prescription model
                app_date: appointment.app_date, // Appointment date
                startTime: moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A"), // Formatted start time
                endTime: moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A") // Formatted end time
            };
        });
  
        res.status(200).json({
            status: 200,
            message: "Successfully fetched all prescriptions",
            success: true,
            data: detailedPrescriptions,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPrescriptionsByPatientId
}