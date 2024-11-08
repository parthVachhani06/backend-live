// const mongoose = require("mongoose");
const moment = require('moment-timezone')
const AppointmentBook = require("../../models/bookAppointment.model");
const Prescription = require("../../models/prescription.model");
/* ------------------------------- CREATE Hospital  ------------------------------- */
const createPrescription= async (req, res) => {
  try {
    const reqBody = req.body;   
    const prescription = await Prescription.create(reqBody);
    if (!prescription) {
      throw new Error("Failed to create prescription");
    }
    res.status(200).json({
      status:200,
      message: "Successfully created a new prescription",
      success: true,
      data: prescription,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getPrescriptionsByPatientId = async (req, res) => {
    try {
      const { patientId } = req.body; // Get patientId from the request body
  
      // Fetch all appointments for the given patientId
      const appointments = await AppointmentBook.find({ patientId });
  
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
  
      res.status(200).json({
        status: 200,
        message: "Successfully fetched all prescriptions",
        success: true,
        data: prescriptions,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

  const patientDetailFromDoctorIdInDoctorFlowAppointments = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body; // Extract doctorId and patientId from req.body

        if (!doctorId || !patientId) {
            return res.status(400).json({ message: 'Both doctorId and patientId are required in the request body.' });
        }

        // Find the last appointment where both doctorId and patientId match the request
        const lastAppointment = await AppointmentBook.findOne({
            doctorId: doctorId,         // Filter by doctorId from req.body
            patientId: patientId        // Filter by patientId from req.body
        })
        // Sort by app_date and endTime in descending order to get the latest appointment
        .sort({ app_date: -1, endTime: -1 })
        // Populate patient details
        .populate('patientId', 'first_name last_name phone_number gender age patient_address image')
        // Populate doctor details (assuming you have a Doctor model with name fields)
        .populate('doctorId', 'firstName')
        // Select specific fields from the appointment schema itself
        .select('appointmentType app_date endTime patient_issue');

        // Check if an appointment exists
        if (!lastAppointment) {
            return res.status(404).json({ message: 'No appointments found for the specified doctor and patient.' });
        }

        // Return the last appointment
        return res.status(200).json({
            message: 'Last appointment retrieved successfully.',
            appointment: lastAppointment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving the last appointment.' });
    }
};

const getPrescriptionDetailsByPatientId = async (req, res) => {
    try {
        // Fetch all prescriptions with populated appointment and patient details
        const prescriptions = await Prescription.find()
          .populate({
            path: 'appointmentId', // Populate appointment details
            populate: {
              path: 'patientId', // Populate patient details inside the appointment
              select: 'first_name last_name phone_number age gender', // Select the required fields from Patient
            },
            select: 'appointmentType endTime', // Select the required fields from Appointment
          });
    
        if (prescriptions.length === 0) {
          return res.status(404).json({
            status: 404,
            message: "No prescriptions found",
            success: false,
          });
        }
    
        res.status(200).json({
          status: 200,
          message: "Successfully fetched all prescription details",
          success: true,
          data: prescriptions,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    };

    const getOldPrescriptionDetails = async (req, res) => {
      try {
          // Get today's date in 'YYYY-MM-DD' format
          const today = moment().format('YYYY-MM-DD');
  
          // Fetch prescriptions where the appointment's app_date is in the past (before today)
          const prescriptions = await Prescription.find()
              .populate({
                  path: 'appointmentId', // Populate appointment details
                  match: { app_date: { $lt: today } }, // Match appointments with app_date earlier than today
                  populate: {
                      path: 'patientId', // Populate patient details inside the appointment
                      select: 'first_name last_name phone_number age gender', // Select required fields from Patient
                  },
                  select: 'appointmentType endTime app_date', // Select required fields from Appointment
              }).select('_id');
  
          // Filter out prescriptions that don't have a past appointment (in case of null match due to filtering)
          const oldPrescriptions = prescriptions.filter(prescription => prescription.appointmentId);
  
          if (oldPrescriptions.length === 0) {
              return res.status(404).json({
                  status: 404,
                  message: "No old prescriptions found",
                  success: false,
              });
          }
  
          res.status(200).json({
              status: 200,
              message: "Successfully fetched old prescriptions",
              success: true,
              data: oldPrescriptions,
          });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  };
  
      
      const getAllAppointments = async (req, res) => {
        try {
            // Get today's date in 'YYYY-MM-DD' format
            const today = moment().format('YYYY-MM-DD');
    
            // Find all appointments where app_date is equal to today
            const todaysAppointments = await AppointmentBook.find({ app_date: today })
                // Populate necessary fields
                .populate('doctorId', 'firstName')
                .populate('patientId', 'first_name last_name age gender')
                .select('endTime appointmentType');

   
                if(!todaysAppointments){
      res.status(400).json({
        message:'today appointement not found'
      })
     }
            // Return the list of today's appointments
            return res.status(200).json({
                message: 'Today\'s appointment list retrieved successfully.',
                appointments: todaysAppointments
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while retrieving today\'s appointments.' });
        }
    };

    const getAppointmentsByDateRange = async (req, res) => {
      try {
          // Extract fromDate and toDate from query parameters
          const { fromDate, toDate } = req.query;
  
          // Validate the date formats and convert them to the required format
          const formattedFromDate = moment(fromDate, "DD-MM-YYYY", true);
          const formattedToDate = moment(toDate, "DD-MM-YYYY", true);
  
          if (!formattedFromDate.isValid() || !formattedToDate.isValid()) {
              return res.status(400).json({ message: 'Invalid date format. Please use "DD-MM-YYYY".' });
          }
  
          // Convert dates to ISO format (YYYY-MM-DDTHH:mm:ss.sssZ) for MongoDB queries
          const from = formattedFromDate.startOf('day').toISOString(); // Set to start of the day
          const to = formattedToDate.endOf('day').toISOString(); // Set to end of the day
  
          // Find appointments within the specified date range
          const appointments = await AppointmentBook.find({
              app_date: { $gte: from, $lte: to }
          })
          .select('appointmentType app_date startTime patient_issue diseas_name') // Adjust fields as needed
          // .populate('doctorId', 'firstName')
          .populate('patientId', 'first_name last_name')
          // .populate('doctorTimeSlot', 'timeslot'); // Populate hospital name
  
          // Check if any appointments were found
          if (!appointments.length) {
              return res.status(404).json({ message: 'No appointments found in the specified date range.' });
          }
  
          // Return the list of appointments
          return res.status(200).json({
              message: 'Appointments retrieved successfully.',
              appointments
          });
      } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'An error occurred while retrieving appointments.' });
      }
  };
    
  
module.exports = {
    createPrescription,
    getPrescriptionsByPatientId,
    patientDetailFromDoctorIdInDoctorFlowAppointments,
    getPrescriptionDetailsByPatientId,
    getOldPrescriptionDetails,
    getAllAppointments,
    getAppointmentsByDateRange
 
  };
