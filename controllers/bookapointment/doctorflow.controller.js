const { formatToIST } = require('../../helpers/timeFormat'); // Import time formatting utility
const moment = require('moment');
const AppointmentBook = require('../../models/bookAppointment.model');
const Patient = require('../../models/patient.model');
const Doctor = require('../../models/doctor.model');
const mongoose = require('mongoose');


const getTodayAppointments = async (req, res) => {
    try {
        // Get today's date in 'YYYY-MM-DD' format
        const today = moment().format('YYYY-MM-DD');

        // Find all appointments where app_date matches today
        const todayAppointments = await AppointmentBook.find({
            app_date: today
        })
        .select('appointmentType app_date patient_issue diseas_name startTime') // Adjust fields as needed
        .populate('patientId', 'first_name last_name');

        // Check if any appointments were found
        if (!todayAppointments.length) {
            return res.status(404).json({ message: 'No appointments found for today.' });
        }

        // Format the startTime to Indian Standard Time (IST) for each appointment
        const formattedAppointments = todayAppointments.map(appointment => {
            const startTimeIST = moment(appointment.startTime).tz('Asia/Kolkata').format('h:mm A'); // Convert to IST in 'h:mm A' format
            return {
                ...appointment.toObject(),
                startTime: startTimeIST  // Overwrite startTime with formatted IST time
            };
        });

        // Return the list of today's appointments with formatted time
        return res.status(200).json({
            message: 'Today\'s appointments retrieved successfully.',
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving today\'s appointments.' });
    }
};


const getUpcomingAppointments = async (req, res) => {
    try {
        // Get today's date in 'YYYY-MM-DD' format
        const today = moment().format('YYYY-MM-DD');

        // Find all appointments where app_date is after today
        const upcomingAppointments = await AppointmentBook.find({
            app_date: { $gt: today }
        })
        .select('appointmentType app_date patient_issue diseas_name startTime') // Adjust fields as needed
        .populate('patientId', 'first_name last_name');

        // Check if any upcoming appointments were found
        if (!upcomingAppointments.length) {
            return res.status(404).json({ message: 'No upcoming appointments found.' });
        }

        // Format the startTime to Indian Standard Time (IST) for each appointment
        const formattedAppointments = upcomingAppointments.map(appointment => {
            const startTimeIST = moment(appointment.startTime).tz('Asia/Kolkata').format('h:mm A'); // Convert to IST in 'h:mm A' format
            return {
                ...appointment.toObject(),
                startTime: startTimeIST  // Overwrite startTime with formatted IST time
            };
        });

        // Return the list of upcoming appointments with formatted time
        return res.status(200).json({
            message: 'Upcoming appointments retrieved successfully.',
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving upcoming appointments.' });
    }
};



const getPreviousAppointments = async (req, res) => {
    try {
        // Get today's date in 'YYYY-MM-DD' format
        const today = moment().format('YYYY-MM-DD');

        // Find all appointments where app_date is before today
        const previousAppointments = await AppointmentBook.find({
            app_date: { $lt: today }
        })
        .select('appointmentType app_date patient_issue diseas_name startTime') // Add startTime field
        .populate('patientId', 'first_name last_name');

        // Check if any previous appointments were found
        if (!previousAppointments.length) {
            return res.status(404).json({ message: 'No previous appointments found.' });
        }

        // Format startTime to IST
        const formattedAppointments = previousAppointments.map(appointment => ({
            ...appointment._doc,
            startTime: formatToIST(appointment.startTime) // Convert to IST
        }));

        // Return the list of previous appointments
        return res.status(200).json({
            message: 'Previous appointments retrieved successfully.',
            appointments: formattedAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving previous appointments.' });
    }
};


const getCanceledAppointments = async (req, res) => {
    try {
        // Find all appointments where status is 'canceled'
        const canceledAppointments = await AppointmentBook.find({
            status: 0
        })
        .select('appointmentType app_date startTime  patient_issue diseas_name') // Adjust fields as needed
        // .populate('doctorId', 'firstName')
        .populate('patientId', 'first_name last_name')
       

        // Check if any canceled appointments were found
        if (!canceledAppointments.length) {
            return res.status(404).json({ message: 'No canceled appointments found.' });
        }

        // Return the list of canceled appointments
        return res.status(200).json({
            message: 'Canceled appointments retrieved successfully.',
            appointments: canceledAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving canceled appointments.' });
    }
};




// Controller to delete app_date and doctorTimeSlot from appointment by appointmentId
const deleteAppDateAndTimeSlot = async (req, res) => {
    try {
        // Extract the appointmentId from the request body
        const { appointmentId } = req.body;

        // Check if the appointment exists
        const appointment = await AppointmentBook.findById(appointmentId);

        // If no appointment is found, return an error
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Use $unset to remove the app_date and startTime fields from the appointment
        await AppointmentBook.findByIdAndUpdate(appointmentId, {
            $unset: { app_date: "", startTime: ""  ,endTime:""} // Unset both app_date and startTime
        });

        // Return success response
        return res.status(200).json({ message: 'app_date and startTime deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting app_date and startTime.' });
    }
};


const updateAppointmentDetails = async (req, res) => {
    try {
        // Extract the appointmentId, app_date, doctorTimeSlot (app_time), and add_notes from the request body
        const { appointmentId, app_date, app_time, add_notes } = req.body;

        // Check if the appointment exists
        const appointment = await AppointmentBook.findById(appointmentId);

        // If no appointment is found, return an error
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Ensure the date is parsed correctly by explicitly specifying the format
        const formattedAppDate = moment(app_date, "DD MMM YYYY", true).format("YYYY-MM-DD");
        if (!moment(formattedAppDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
        }

        // Split app_time into startTime and endTime
        const [startTime, endTime] = app_time.split(' - ');

        // Validate and format startTime and endTime to IST timezone
        const formattedStartTime = moment.tz(`${app_date} ${startTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format(); // Convert to ISO format in IST
        const formattedEndTime = moment.tz(`${app_date} ${endTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format(); // Convert to ISO format in IST

        if (!moment(formattedStartTime).isValid() || !moment(formattedEndTime).isValid()) {
            return res.status(400).json({ message: 'Invalid time format. Please use "h:mm A".' });
        }

        // Use $set to update app_date, startTime, endTime, and add_notes fields
        const updatedAppointment = await AppointmentBook.findByIdAndUpdate(
            appointmentId,
            {
                $set: {
                    app_date: formattedAppDate,   // Set the new app_date
                    startTime: formattedStartTime, // Set the new startTime in IST
                    endTime: formattedEndTime,     // Set the new endTime in IST
                    add_notes                     // Set the new add_notes
                }
            },
            { new: true } // Return the updated document
        );

        // Return success response with updated appointment details
        return res.status(200).json({
            message: 'Appointment details updated successfully.',
            updatedAppointment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating appointment details.' });
    }
};


// Controller to get appointments within a specific date range
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

const getAllAppointments = async (req, res) => {
    try {
        // Get today's date in 'YYYY-MM-DD' format
        const today = moment().format('YYYY-MM-DD');

        // Find all appointments where app_date is before today
        const previousAppointments = await AppointmentBook.find()
 // Adjust fields as needed
        // .populate('doctorId', 'firstName')
        .populate('patientId', 'first_name last_name')
      

        // Return the list of previous appointments
        return res.status(200).json({
            message: 'all appointment list successfully.',
            appointments: previousAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving previous appointments.' });
    }
};

// const createAppointmentNote = async (req, res) => {
//     try {
//         // Extract appointment details from request body
//         const { app_date, app_time, notes } = req.body;

//         // Validate required fields
//         if (!app_date || !app_time || !notes) {
//             return res.status(400).json({ message: 'app_date, app_time, and notes are required.' });
//         }

//         // Ensure the date is parsed correctly
//         const formattedAppDate = moment(app_date, "DD MMM YYYY", true).format("YYYY-MM-DD");
//         if (!moment(formattedAppDate, "YYYY-MM-DD", true).isValid()) {
//             return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
//         }

//         // Split app_time into startTime and endTime
//         const [startTime, endTime] = app_time.split(' - ');

//         // Validate startTime and endTime
//         const formattedStartTime = moment.tz(`${app_date} ${startTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format();
//         const formattedEndTime = moment.tz(`${app_date} ${endTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format();

//         if (!moment(formattedStartTime).isValid() || !moment(formattedEndTime).isValid()) {
//             return res.status(400).json({ message: 'Invalid time format. Please use "h:mm A".' });
//         }

//         // Create a new appointment note record
//         const newAppointmentNote = new AppointmentNote({ // Assuming you have an AppointmentNote model
//             app_date: formattedAppDate,
//             startTime: formattedStartTime,
//             endTime: formattedEndTime,
//             notes
//         });

//         // Save the appointment note to the database
//         await newAppointmentNote.save();

//         // Respond with success
//         return res.status(201).json({ message: 'Appointment note created successfully!', appointmentNote: newAppointmentNote });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'An error occurred while creating the appointment note.' });
//     }
// };

const createAppointmentNote = async (req, res) => {
    try {
        // Extract the appointmentId, app_date, doctorTimeSlot (app_time), and add_notes from the request body
        const { appointmentId, app_date, app_time, add_notes } = req.body;

        // Check if the appointment exists
        const appointment = await AppointmentBook.findById(appointmentId);

        // If no appointment is found, return an error
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Ensure the date is parsed correctly by explicitly specifying the format
        const formattedAppDate = moment(app_date, "DD MMM YYYY", true).format("YYYY-MM-DD");
        if (!moment(formattedAppDate, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: 'Invalid date format. Please use "DD MMM YYYY".' });
        }

        // Split app_time into startTime and endTime
        const [startTime, endTime] = app_time.split(' - ');

        // Validate and format startTime and endTime to IST timezone
        const formattedStartTime = moment.tz(`${app_date} ${startTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format(); // Convert to ISO format in IST
        const formattedEndTime = moment.tz(`${app_date} ${endTime}`, "DD MMM YYYY h:mm A", "Asia/Kolkata").format(); // Convert to ISO format in IST

        if (!moment(formattedStartTime).isValid() || !moment(formattedEndTime).isValid()) {
            return res.status(400).json({ message: 'Invalid time format. Please use "h:mm A".' });
        }

        // Use $set to update app_date, startTime, endTime, and add_notes fields
        const updatedAppointment = await AppointmentBook.findByIdAndUpdate(
            appointmentId,
            {
                $set: {
                    app_date: formattedAppDate,   // Set the new app_date
                    startTime: formattedStartTime, // Set the new startTime in IST
                    endTime: formattedEndTime,     // Set the new endTime in IST
                    add_notes                     // Set the new add_notes
                }
            },
            { new: true } // Return the updated document
        );

        // Return success response with updated appointment details
        return res.status(200).json({
            message: 'Appointment details updated successfully.',
            updatedAppointment
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating appointment details.' });
    }
};

// pateint record access in doctor flow
const getDetailsPatients = async (req, res) => {
    try {
        const { doctorId } = req.body; // Get doctorId from the request body

        // Validate doctorId
        if (!doctorId) {
            return res.status(400).json({ message: 'Doctor ID is required.' });
        }

        // Aggregate to get last appointment details for all patients associated with the doctor
        const lastAppointments = await AppointmentBook.aggregate([
            {
                $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } // Match appointments by doctorId
            },
            {
                $sort: { app_date: -1, endTime: -1 } // Sort by app_date and endTime in descending order
            },
            {
                $group: {
                    _id: "$patientId", // Group by patientId
                    lastAppointment: { $first: "$$ROOT" } // Get the most recent appointment
                }
            },
            {
                $lookup: {
                    from: "patients", // Lookup patient details
                    localField: "_id", // Match patientId
                    foreignField: "_id",
                    as: "patientDetails"
                }
            },
            {
                $unwind: "$patientDetails" // Unwind the patientDetails array
            },
            {
                $project: {
                    _id: 0, // Exclude _id
                    patientId: "$_id",
                    app_date: "$lastAppointment.app_date", // Include the last app_date
                    endTime: "$lastAppointment.endTime", // Include the last endTime
                    first_name: "$patientDetails.first_name", // Include patient first name
                    last_name: "$patientDetails.last_name", // Include patient last name
                    age: "$patientDetails.age", // Include patient age
                    gender: "$patientDetails.gender", // Include patient gender
                    diseas_name: "$lastAppointment.diseas_name", // Include disease name from last appointment
                    patient_issue: "$lastAppointment.patient_issue" // Include patient issue from last appointment
                }
            }
        ]);

        // Check if any appointments were found
        if (!lastAppointments.length) {
            return res.status(404).json({ message: 'No appointments found for this doctor.' });
        }

        // Return the list of patients with their last appointment details
        return res.status(200).json({
            message: 'All patients with their last appointment retrieved successfully.',
            patients: lastAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving the appointments.' });
    }
};

// patient record access in searching result month week day waise in doctor flow

const getDetailsPatientsSearching = async (req, res) => {
        try {
            const { doctorId, periodType } = req.body; // Get doctorId and periodType from the request body
    
            // Validate doctorId
            if (!doctorId) {
                return res.status(400).json({ message: 'Doctor ID is required.' });
            }
    
            // Calculate the date range based on the periodType (month, week, days)
            let startDate;
            const today = moment().endOf('day'); // Today's date
    
            switch (periodType) {
                case 'month':
                    startDate = moment().startOf('month'); // Get the start of the current month
                    break;
                case 'week':
                    startDate = moment().startOf('week'); // Get the start of the current week
                    break;
                case 'day':
                    startDate = moment().startOf('day'); // Get the start of the current day
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid period type. Use "month", "week", or "day".' });
            }
    
            // Aggregate to get the last appointment details for each patient
            const appointments = await AppointmentBook.aggregate([
                {
                    $match: {
                        doctorId: new mongoose.Types.ObjectId(doctorId), // Match appointments by doctorId
                        app_date: { $gte: new Date(startDate), $lte: new Date(today) } // Filter by app_date range
                    }
                },
                {
                    $sort: { app_date: -1, endTime: -1 } // Sort by app_date and endTime in descending order
                },
                {
                    $group: {
                        _id: "$patientId", // Group by patientId
                        lastAppointment: { $first: "$$ROOT" } // Get the most recent appointment for each patient
                    }
                },
                {
                    $lookup: {
                        from: "patients", // Lookup patient details
                        localField: "_id", // Match patientId
                        foreignField: "_id",
                        as: "patientDetails"
                    }
                },
                {
                    $unwind: "$patientDetails" // Unwind the patientDetails array
                },
                {
                    $project: {
                        _id: 0, // Exclude _id
                        patientId: "$_id", // Include patient ID
                        first_name: "$patientDetails.first_name", // Include patient first name
                        last_name: "$patientDetails.last_name", // Include patient last name
                        diseas_name: "$lastAppointment.diseas_name", // Include disease name from last appointment
                        patient_issue: "$lastAppointment.patient_issue", // Include patient issue from last appointment
                        app_date: "$lastAppointment.app_date", // Include the last app_date
                        endTime: "$lastAppointment.endTime" // Include the last endTime
                    }
                }
            ]);
    
            // Check if any appointments were found
            if (!appointments.length) {
                return res.status(404).json({ message: `No appointments found for this doctor within the specified ${periodType}.` });
            }
    
            // Return the list of patients with their last appointment details
            return res.status(200).json({
                message: `All patients with their last appointment for the selected ${periodType} retrieved successfully.`,
                patients: appointments
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'An error occurred while retrieving the appointments.' });
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


const getAppointmentsByDoctor = async (req, res) => {
    try {
        const { patientId } = req.body; // Extract patientId from req.body

        if (!patientId) {
            return res.status(400).json({ message: 'patientId is required in the request body.' });
        }

        // Find all appointments where patientId matches the request
        const appointments = await AppointmentBook.find({
            patientId: patientId         // Filter by patientId from req.body
        })
        // Populate doctor details (assuming you have a Doctor model with name fields)
        .populate('doctorId', 'firstName')
        // Select specific fields from the appointment schema itself
        .select('appointmentType app_date endTime');

        // Check if appointments exist
        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for the specified patient.' });
        }

        // Return the list of appointments
        return res.status(200).json({
            message: 'Appointments retrieved successfully.',
            appointments: appointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving the appointments.' });
    }
};



module.exports = {getDetailsPatientsSearching,getAppointmentsByDoctor,patientDetailFromDoctorIdInDoctorFlowAppointments,createAppointmentNote,getDetailsPatients,getAllAppointments, getPreviousAppointments,getTodayAppointments,getAppointmentsByDateRange,getUpcomingAppointments ,updateAppointmentDetails,getCanceledAppointments,deleteAppDateAndTimeSlot};