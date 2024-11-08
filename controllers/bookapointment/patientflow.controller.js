const AppointmentBook = require('../../models/bookAppointment.model');
// const Appointment = require('../models/Appointment');
const moment = require('moment-timezone');
const Doctor = require('../../models/doctor.model');

// Function to fetch today's appointments for a particular patient
// Function to fetch today's appointments for a particular patient
const getTodaysAppointmentsForPatient = async (req, res) => {
    try {
        const { patientId } = req.body; // Get the patientId from request body

        // Get today's date in 'YYYY-MM-DD' format
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

        // Find all appointments for the patient for today and populate doctor and hospital details
        const appointments = await AppointmentBook.find({
            patientId,
            app_date: todayDate
        })
        .populate('doctorId', 'firstName hospitalName')  // Populate doctor's first name
        // .populate('hospitalId', 'hospitalName');  // Populate hospital's name

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for today.' });
        }

        // Format the startTime and endTime to Indian time format (h:mm A)
        const formattedAppointments = appointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentType: appointment.appointmentType,
                // hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                app_date: appointment.app_date,
                startTime: formattedStartTime, // Showing in h:mm A (Indian format)
                endTime: formattedEndTime,     // Showing in h:mm A (Indian format)
                patient_issue: appointment.patient_issue,
                doctorFirstName: appointment.doctorId.firstName ,// Populated doctor's first name
                doctorHospitalName: appointment.doctorId.hospitalName // Populated doctor's first name

            };
        });

        // Send the response with the formatted appointments
        return res.status(200).json({
            message: 'Today\'s appointments fetched successfully!',
            appointments: formattedAppointments
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};


// Function to fetch appointments for a particular patient within a date range
const getAppointmentsForPatientInRange = async (req, res) => {
    try {
        const { patientId, fromDate, toDate } = req.body; // Get patientId, fromDate, and toDate from request body

        // Validate that fromDate and toDate are provided
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Both fromDate and toDate are required.' });
        }

        // Parse the dates to ensure they are in 'YYYY-MM-DD' format
        const formattedFromDate = moment(fromDate, "DD MMM YYYY", true).format("YYYY-MM-DD");
        const formattedToDate = moment(toDate, "DD MMM YYYY", true).format("YYYY-MM-DD");

        // Validate the date formats
        if (!moment(formattedFromDate, "YYYY-MM-DD", true).isValid() || !moment(formattedToDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
        }

        // Find appointments for the patient within the date range and populate doctor and hospital details
        const appointments = await AppointmentBook.find({
            patientId,
            app_date: { $gte: formattedFromDate, $lte: formattedToDate } // Filter by date range
        })
        .populate('doctorId', 'firstName')  // Populate doctor's first name
        .populate('hospitalId', 'hospitalName');  // Populate hospital's name

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for the specified date range.' });
        }

        // Format the startTime and endTime to Indian time format (h:mm A)
        const formattedAppointments = appointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentType: appointment.appointmentType,
                hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                app_date: appointment.app_date,
                startTime: formattedStartTime, // Showing in h:mm A (Indian format)
                endTime: formattedEndTime,     // Showing in h:mm A (Indian format)
                patient_issue: appointment.patient_issue,
                doctorFirstName: appointment.doctorId.firstName // Populated doctor's first name
            };
        });

        // Send the response with the formatted appointments
        return res.status(200).json({
            message: 'Appointments fetched successfully!',
            appointments: formattedAppointments
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};


// Function to fetch all appointments for a particular patient with a specific doctor
const getPatientAppointmentsWithDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body; // Get doctorId from request body

        // Validate that doctorId is provided
        if (!doctorId) {
            return res.status(400).json({ message: 'doctorId is required.' });
        }

        // Find the doctor by doctorId and select the required fields
        const doctor = await Doctor.findById(doctorId).select('doctorname firstName gender image breakTime workingTime hospitalName qualification experience emergencyContactNumber description');

        // Check if the doctor exists
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Send the response with the appointments and doctor details
        return res.status(200).json({
            message: 'Appointments fetched successfully!',
            doctorDetails: {
                doctorname: doctor.doctorname,
                firstName: doctor.firstName,
                gender: doctor.gender,
                image: doctor.image,
                breakTime: doctor.breakTime,
                workingTime: doctor.workingTime,
                hospitalName: doctor.hospitalName,
                qualification: doctor.qualification,
                experience: doctor.experience,
                emergencyContactNumber: doctor.emergencyContactNumber,
                description: doctor.description,
            
            }
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};


const getPreviousAppointmentsForPatient = async (req, res) => {
    try {
        const { patientId } = req.body; // Get the patientId from the request body

        // Get today's date in 'YYYY-MM-DD' format
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

        // Find all appointments for the patient with a date before today
        const appointments = await AppointmentBook.find({
            patientId,
            app_date: { $lt: todayDate }  // $lt operator to find appointments before today
        })
        .populate('doctorId', 'firstName hospitalName')  // Populate doctor's first name and hospital name
        // .populate('hospitalId', 'hospitalName');  // Populate hospital's name if needed

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No previous appointments found.' });
        }

        // Format the startTime and endTime to Indian time format (h:mm A)
        const formattedAppointments = appointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentType: appointment.appointmentType,
                // hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                app_date: appointment.app_date,
                startTime: formattedStartTime, // Showing in h:mm A (Indian format)
                endTime: formattedEndTime,     // Showing in h:mm A (Indian format)
                patient_issue: appointment.patient_issue,
                doctorFirstName: appointment.doctorId.firstName,  // Populated doctor's first name
                doctorHospitalName: appointment.doctorId.hospitalName  // Populated doctor's hospital name
            };
        });

        // Send the response with the formatted previous appointments
        return res.status(200).json({
            message: 'Previous appointments fetched successfully!',
            appointments: formattedAppointments
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching previous appointments.' });
    }
};


const getPreviousAppointmentsForPatientInRange = async (req, res) => {
    try {
        const { patientId, fromDate, toDate } = req.body; // Get patientId, fromDate, and toDate from request body

        // Validate that fromDate and toDate are provided
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Both fromDate and toDate are required.' });
        }

        // Parse the dates, allowing flexibility in the input date format (e.g., '09 september 2024')
        const formattedFromDate = moment(fromDate, "DD MMMM YYYY").format("YYYY-MM-DD");
        const formattedToDate = moment(toDate, "DD MMMM YYYY").format("YYYY-MM-DD");

        // Validate that the parsed dates are valid
        if (!moment(formattedFromDate, "YYYY-MM-DD", true).isValid() || !moment(formattedToDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Please ensure correct dates.' });
        }

        // Get today's date in 'YYYY-MM-DD' format
        const todayDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

        // Ensure that toDate is before today
        if (formattedToDate >= todayDate) {
            return res.status(400).json({ message: 'The toDate must be earlier than today.' });
        }

        // Find previous appointments for the patient within the date range and populate doctor and hospital details
        const appointments = await AppointmentBook.find({
            patientId,
            app_date: { $gte: formattedFromDate, $lte: formattedToDate, $lt: todayDate } // Filter by date range and before today
        })
        .populate('doctorId', 'firstName')  // Populate doctor's first name
        .populate('hospitalId', 'hospitalName');  // Populate hospital's name

        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No previous appointments found for the specified date range.' });
        }

        // Format the startTime and endTime to Indian time format (h:mm A)
        const formattedAppointments = appointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentType: appointment.appointmentType,
                hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                app_date: appointment.app_date,
                startTime: formattedStartTime, // Showing in h:mm A (Indian format)
                endTime: formattedEndTime,     // Showing in h:mm A (Indian format)
                patient_issue: appointment.patient_issue,
                doctorFirstName: appointment.doctorId.firstName // Populated doctor's first name
            };
        });

        // Send the response with the formatted previous appointments
        return res.status(200).json({
            message: 'Previous appointments fetched successfully!',
            appointments: formattedAppointments
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching previous appointments.' });
    }
};

// Function to fetch all appointments for a particular patient with a specific doctor
const getPatientAppointmentsWithDoctorPrevious = async (req, res) => {
    try {
        const { doctorId } = req.body; // Get doctorId from request body

        // Validate that doctorId is provided
        if (!doctorId) {
            return res.status(400).json({ message: 'doctorId is required.' });
        }

        // Find the doctor by doctorId and select the required fields
        const doctor = await Doctor.findById(doctorId).select('doctorname firstName gender image breakTime workingTime hospitalName qualification experience emergencyContactNumber description');

        // Check if the doctor exists
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Send the response with the appointments and doctor details
        return res.status(200).json({
            message: 'Appointments fetched successfully!',
            doctorDetails: {
                doctorname: doctor.doctorname,
                firstName: doctor.firstName,
                gender: doctor.gender,
                image: doctor.image,
                breakTime: doctor.breakTime,
                workingTime: doctor.workingTime,
                hospitalName: doctor.hospitalName,
                qualification: doctor.qualification,
                experience: doctor.experience,
                emergencyContactNumber: doctor.emergencyContactNumber,
                description: doctor.description,
            
            }
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};

const getCanceledAppointments = async (req, res) => {
    try {
        const { patientId } = req.body; // Get patientId from the request body (optional)

        // Build the query for canceled appointments
        const query = { status: '0' };

        // If a patientId is provided, add it to the query
        if (patientId) {
            query.patientId = patientId;
        }

        // Find all canceled appointments and populate doctor and hospital details
        const canceledAppointments = await AppointmentBook.find(query)
            .populate('doctorId', 'firstName')
            .populate('hospitalId', 'hospitalName');

        if (!canceledAppointments || canceledAppointments.length === 0) {
            return res.status(404).json({ message: 'No canceled appointments found.' });
        }

        // Format the cancel_date and cancel_time
        const formattedAppointments = canceledAppointments.map(appointment => {
            const formattedCancelDate = moment(appointment.cancel_date).tz("Asia/Kolkata").format("YYYY-MM-DD");
            const formattedCancelTime = moment(appointment.cancel_time).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentId: appointment._id,
                appointmentType: appointment.appointmentType,
                hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                cancel_date: formattedCancelDate,
                cancel_time: formattedCancelTime,
                doctorFirstName: appointment.doctorId.firstName,
                status: appointment.status,
            };
        });

        // Return the list of canceled appointments
        return res.status(200).json({
            message: 'Canceled appointments fetched successfully!',
            appointments: formattedAppointments,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching canceled appointments.' });
    }
};

const getPatientAppointmentsWithDoctorcancel = async (req, res) => {
    try {
        const { doctorId } = req.body; // Get doctorId from request body

        // Validate that doctorId is provided
        if (!doctorId) {
            return res.status(400).json({ message: 'doctorId is required.' });
        }

        // Find the doctor by doctorId and select the required fields
        const doctor = await Doctor.findById(doctorId).select('doctorname firstName gender image breakTime workingTime hospitalName qualification experience emergencyContactNumber description');

        // Check if the doctor exists
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Send the response with the appointments and doctor details
        return res.status(200).json({
            message: 'Appointments fetched successfully!',
            doctorDetails: {
                doctorname: doctor.doctorname,
                firstName: doctor.firstName,
                gender: doctor.gender,
                image: doctor.image,
                breakTime: doctor.breakTime,
                workingTime: doctor.workingTime,
                hospitalName: doctor.hospitalName,
                qualification: doctor.qualification,
                experience: doctor.experience,
                emergencyContactNumber: doctor.emergencyContactNumber,
                description: doctor.description,
            
            }
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};

// const getCanceledAppointmentsInRange = async (req, res) => {
//     try {
//         const { fromDate, toDate, patientId } = req.body;

//         // Validate that fromDate and toDate are provided
//         if (!fromDate || !toDate) {
//             return res.status(400).json({ message: 'Both fromDate and toDate are required.' });
//         }

//         // Parse and format the dates to 'YYYY-MM-DD' format
//         const formattedFromDate = moment(fromDate, "DD MMM YYYY", true).format("YYYY-MM-DD");
//         const formattedToDate = moment(toDate, "DD MMM YYYY", true).format("YYYY-MM-DD");

//         // Validate the date formats
//         if (!moment(formattedFromDate, "YYYY-MM-DD", true).isValid() || !moment(formattedToDate, "YYYY-MM-DD", true).isValid()) {
//             return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
//         }

//         // Build the query for canceled appointments within the date range
//         const query = {
//             status: '0  ',
//             cancel_date: { $gte: formattedFromDate, $lte: formattedToDate } // Filter by date range
//         };

//         // If a patientId is provided, add it to the query
//         if (patientId) {
//             query.patientId = patientId;
//         }

//         // Find all canceled appointments in the date range and populate doctor and hospital details
//         const canceledAppointments = await AppointmentBook.find(query)
//             .populate('doctorId', 'firstName')
//             .populate('hospitalId', 'hospitalName');

//         if (!canceledAppointments || canceledAppointments.length === 0) {
//             return res.status(404).json({ message: 'No canceled appointments found in the specified date range.' });
//         }

//         // Format the cancel_date and cancel_time for the response
//         const formattedAppointments = canceledAppointments.map(appointment => {
//             const formattedCancelDate = moment(appointment.cancel_date).tz("Asia/Kolkata").format("YYYY-MM-DD");
//             const formattedCancelTime = moment(appointment.cancel_time).tz("Asia/Kolkata").format("h:mm A");

//             return {
//                 appointmentId: appointment._id,
//                 appointmentType: appointment.appointmentType,
//                 hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
//                 cancel_date: formattedCancelDate,
//                 cancel_time: formattedCancelTime,
//                 doctorFirstName: appointment.doctorId.firstName,
//                 status: appointment.status,
//             };
//         });

//         // Return the list of canceled appointments in the date range
//         return res.status(200).json({
//             message: 'Canceled appointments fetched successfully!',
//             appointments: formattedAppointments,
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'An error occurred while fetching canceled appointments.' });
//     }
// };


const getPendingAppointments = async (req, res) => {
    try {
        const { fromDate, toDate, patientId } = req.body;

        // Build the query for pending appointments
        const query = {
            status: '0'  // Filter only pending appointments
        };

        // If a patientId is provided, add it to the query
        if (patientId) {
            query.patientId = patientId;
        }

        // If fromDate and toDate are provided, filter by appointment date range
        if (fromDate && toDate) {
            const formattedFromDate = moment(fromDate, "DD MMM YYYY", true).format("YYYY-MM-DD");
            const formattedToDate = moment(toDate, "DD MMM YYYY", true).format("YYYY-MM-DD");

            // Validate the date formats
            if (!moment(formattedFromDate, "YYYY-MM-DD", true).isValid() || !moment(formattedToDate, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
            }

            query.app_date = { $gte: formattedFromDate, $lte: formattedToDate }; // Filter by date range
        }

        // Find all pending appointments based on the query and populate doctor and hospital details
        const pendingAppointments = await AppointmentBook.find(query)
            .populate('doctorId', 'firstName')
            .populate('hospitalId', 'hospitalName');

        if (!pendingAppointments || pendingAppointments.length === 0) {
            return res.status(404).json({ message: 'No pending appointments found.' });
        }

        // Format the appointment details
        const formattedAppointments = pendingAppointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentId: appointment._id,
                appointmentType: appointment.appointmentType,
                
                app_date: appointment.app_date,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                patient_issue: appointment.patient_issue,

                status: appointment.status
            };
        });

        // Return the list of pending appointments
        return res.status(200).json({
            message: 'Pending appointments fetched successfully!',
            appointments: formattedAppointments,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching pending appointments.' });
    }
};

const getPatientAppointmentsWithDoctorPending = async (req, res) => {
    try {
        const { doctorId } = req.body; // Get doctorId from request body

        // Validate that doctorId is provided
        if (!doctorId) {
            return res.status(400).json({ message: 'doctorId is required.' });
        }

        // Find the doctor by doctorId and select the required fields
        const doctor = await Doctor.findById(doctorId).select('doctorname firstName gender image breakTime workingTime hospitalName qualification experience emergencyContactNumber description');

        // Check if the doctor exists
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Send the response with the appointments and doctor details
        return res.status(200).json({
            message: 'Appointments fetched successfully!',
            doctorDetails: {
                doctorname: doctor.doctorname,
                firstName: doctor.firstName,
                gender: doctor.gender,
                image: doctor.image,
                breakTime: doctor.breakTime,
                workingTime: doctor.workingTime,
                hospitalName: doctor.hospitalName,
                qualification: doctor.qualification,
                experience: doctor.experience,
                emergencyContactNumber: doctor.emergencyContactNumber,
                description: doctor.description,
            
            }
        });

    } catch (error) {
        // Handle any errors during the fetching process
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching appointments.' });
    }
};


const getPendingAppointmentsInRange = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body; // Get fromDate and toDate from the request body

        // Validate that fromDate and toDate are provided
        if (!fromDate || !toDate) {
            return res.status(400).json({ message: 'Both fromDate and toDate are required.' });
        }

        // Parse the dates to ensure they are in 'YYYY-MM-DD' format
        const formattedFromDate = moment(fromDate, "DD MMM YYYY", true).format("YYYY-MM-DD");
        const formattedToDate = moment(toDate, "DD MMM YYYY", true).format("YYYY-MM-DD");

        // Validate the date formats
        if (!moment(formattedFromDate, "YYYY-MM-DD", true).isValid() || !moment(formattedToDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
        }

        // Find all pending appointments within the specified date range
        const pendingAppointments = await AppointmentBook.find({
            status: '0',  // Filter only pending appointments
            app_date: { $gte: formattedFromDate, $lte: formattedToDate } // Filter by date range
        })
        .populate('doctorId', 'firstName')
        .populate('hospitalId', 'hospitalName');

        if (!pendingAppointments || pendingAppointments.length === 0) {
            return res.status(404).json({ message: 'No pending appointments found for the specified date range.' });
        }

        // Format the appointment details
        const formattedAppointments = pendingAppointments.map(appointment => {
            const formattedStartTime = moment(appointment.startTime).tz("Asia/Kolkata").format("h:mm A");
            const formattedEndTime = moment(appointment.endTime).tz("Asia/Kolkata").format("h:mm A");

            return {
                appointmentId: appointment._id,
                appointmentType: appointment.appointmentType,
                hospitalName: appointment.hospitalId.hospitalName, // Populated hospital name
                app_date: appointment.app_date,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                patient_issue: appointment.patient_issue,
                doctorFirstName: appointment.doctorId.firstName,
                status: appointment.status
            };
        });

        // Return the list of pending appointments
        return res.status(200).json({
            message: 'Pending appointments fetched successfully!',
            appointments: formattedAppointments,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching pending appointments.' });
    }
};

module.exports = {
     getTodaysAppointmentsForPatient,
    getAppointmentsForPatientInRange,
    getPatientAppointmentsWithDoctor,

    getPreviousAppointmentsForPatient,
    getPreviousAppointmentsForPatientInRange,
    getPatientAppointmentsWithDoctorPrevious,

    getCanceledAppointments,
    getPatientAppointmentsWithDoctorcancel,
    // getCanceledAppointmentsInRange

    getPendingAppointments,
    getPatientAppointmentsWithDoctorPending,
    getPendingAppointmentsInRange

};
