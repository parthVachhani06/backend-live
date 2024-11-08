// const mongoose = require("mongoose");

const AppointmentBook = require("../../../models/bookAppointment.model");
const Patient = require("../../../models/patient.model");
const Prescription = require("../../../models/prescription.model");

/* ------------------------------- CREATE Hospital  ------------------------------- */
const getpatintDetails = async (req, res) => {
    try {
        const { patientIds } = req.body; // Expecting an array of patient IDs in the request body
    
        // Validate patientIds
        if (!patientIds) {
          return res.status(400).json({ message: 'Invalid patient IDs' });
        }
    
        // Fetch patient details
        const patients = await Patient.find({ _id: { $in: patientIds } });
    
        // If no patients found
        if (patients.length === 0) {
          return res.status(404).json({ message: 'No patients found' });
        }
    
        res.status(200).json(patients);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
      }
    }

    const getPatientDetailsMedicalView = async (req, res) => {
            try {
              const { patientId } = req.body; // Expecting patientId in the request body
          
              // Validate patientId
              if (!patientId) {
                return res.status(400).json({ message: 'Invalid patient ID' });
              }
          
              // Fetch appointments for the specific patientId
              const appointments = await AppointmentBook.find({ patientId })
                .populate('doctorId', 'firstName lastName')  // Populate doctor details
                .populate('hospitalId', 'hospitalName');     // Populate hospital details
          
              // If no appointments found for the patient
              if (appointments.length === 0) {
                return res.status(404).json({ message: 'No appointments found for this patient' });
              }
          
              // Extract the appointmentIds for the patient's appointments
              const appointmentIds = appointments.map(appointment => appointment._id);
          
              // Fetch prescriptions only for the patient's appointments
              const prescriptions = await Prescription.find({ appointmentId: { $in: appointmentIds } });
          
              // Map to extract the required prescription details for this patient
              const prescriptionDetails = appointments.map(appointment => {
                const prescription = prescriptions.find(pres => pres.appointmentId.toString() === appointment._id.toString());
                const doctor = appointment.doctorId;
                const hospital = appointment.hospitalId;
                
                return {
                  prescriptionId: prescription ? prescription._id : null,
                  appointmentId: appointment._id,
                  doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown', // Full doctor name
                  hospitalName: hospital ? hospital.hospitalName : 'Unknown', // Hospital name
                  disease_name: appointment.diseas_name, // Disease name
                  app_date: appointment.app_date, // Appointment date
                  medicines: prescription ? prescription.mdecinename : [], // List of medicine names
                  strength: prescription ? prescription.strenght : [], // List of strengths
                  dosage: prescription ? prescription.dose : [], // List of dosages
                  duration: prescription ? prescription.duration : [], // List of durations
                  whenToTake: prescription ? prescription.when_to_take : [], // List of timings to take the medicine
                  additional_notes: prescription ? prescription.additional_notes : '', // Any additional notes
                };
              });
          
              res.status(200).json(prescriptionDetails);
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Server error' });
            }
          };
          
          const getPatientAppointmentsMedical = async (req, res) => {
            try {
              const { patientId } = req.body; // Expecting patientId in the request body
          
              // Validate patientId
              if (!patientId) {
                return res.status(400).json({ message: 'Invalid patient ID' });
              }
          
              // Fetch all appointments for the specified patientId
              const appointments = await AppointmentBook.find({ patientId })
                .populate('doctorId', 'firstName lastName')  // Populate doctor's first and last name
                .populate('hospitalId', 'hospitalName');     // Populate hospital's name
          
              // If no appointments found for the patient
              if (appointments.length === 0) {
                return res.status(404).json({ message: 'No appointments found for this patient' });
              }
          
              // Map to extract required details from the appointments
              const appointmentDetails = appointments.map(appointment => {
                const doctor = appointment.doctorId;
                const hospital = appointment.hospitalId;
                
                return {
                  appointmentId: appointment._id,
                  doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown', // Full doctor name
                  hospitalName: hospital ? hospital.hospitalName : 'Unknown', // Hospital name
                  disease_name: appointment.diseas_name, // Disease name
                  app_date: appointment.app_date, // Appointment date
                  app_time: appointment.app_time, // Appointment time
                  startTime: appointment.startTime, // Start time
                  endTime: appointment.endTime, // End time
                  status: appointment.status, // Appointment status
                };
              });
          
              // Return the list of appointments for the patient
              res.status(200).json(appointmentDetails);
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Server error' });
            }
          };
          
          const getPatientAppointmentsMedicalPersnoal = async (req, res) => {
            try {
              const { patientId } = req.body; // Expecting patientId in the request body
          
              // Validate patientId
              if (!patientId) {
                return res.status(400).json({ message: 'Invalid patient ID' });
              }
          
              // Fetch all appointments for the specified patientId
              const appointments = await AppointmentBook.find({ patientId })
                .populate('doctorId', 'firstName lastName')  // Populate doctor's first and last name
                .populate('hospitalId', 'hospitalName');     // Populate hospital's name
          
              // If no appointments found for the patient
              if (appointments.length === 0) {
                return res.status(404).json({ message: 'No appointments found for this patient' });
              }
          
              // Map to extract required details from the appointments
              const appointmentDetails = appointments.map(appointment => {
                const doctor = appointment.doctorId;
                const hospital = appointment.hospitalId;
                
                return {
                  appointmentId: appointment._id,
                  doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown', // Full doctor name
                  hospitalName: hospital ? hospital.hospitalName : 'Unknown', // Hospital name
                  disease_name: appointment.diseas_name, // Disease name
                  patient_issue: appointment.patient_issue, // Patient issue
                  appointmentType: appointment.appointmentType, // Appointment type
                  app_date: appointment.app_date, // Appointment date
                  app_time: appointment.app_time, // Appointment time
                  startTime: appointment.startTime, // Start time
                  endTime: appointment.endTime, // End time
                  status: appointment.status, // Appointment status
                };
              });
          
              // Return the list of appointments for the patient
              res.status(200).json(appointmentDetails);
            } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Server error' });
            }
          };
          


module.exports = {
    getpatintDetails,
    getPatientDetailsMedicalView,
    getPatientAppointmentsMedical,
    getPatientAppointmentsMedicalPersnoal
 
  };
